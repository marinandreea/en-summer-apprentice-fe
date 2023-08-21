import { fetchDataFromServer, periodFormat, getEventImageSrc, handleAddToCart, dateFormat, getTicketCategories } from "./src/utilsEvent";
import { getEventsFilteredByVenueAndType, getFilters } from "./src/utilsFilterEvents";
import { removeLoader,addLoader } from "./src/loader";
import{editHandler, saveHandler, cancelHandler, deleteHandler} from "./src/editOrder";

// Navigate to a specific URL
function navigateTo(url) {
  history.pushState(null, null, url);
  renderContent(url);
}
// HTML templates
function getHomePageTemplate() {
  return `
   <div id="content" >
      <section class="cont">
      <div class="slider-wrapper">
      <div class="slider">
      <div class="word"></div>
      </div>      
    </div>
      </section>
      <div class="search">
        <input id="filterInput" type="text" placeholder="Filter by name" class="filter-events px-4 mt-4 mb-0.5 py-2 border"/>
      </div>
      <div class="dropdownContainer">
        <div class="dropdownVenue">
          <select id="selectVenue"></select></div>
        <div class="dropdownType">
          <select id="selectType"></select></div>
        </div>
      </div>
      <div class="events flex items-center justify-center flex-wrap">
      </div>
      
    </div>
  `;
}

function getOrdersPageTemplate() {
  return `
    <div id="content">
      <main class="table">
        <section class="table-header">
          <h1>My Orders</h1>
        </section>
        <section class="table-body">
          <table>
            <thead>
              <tr>
                <th>Order id</th>
                <th> 
                  <button class="text-center justify-center" id="sorting-button-1">
                    <span>Event name</span>
                    <i class="fa-solid fa-arrow-up-wide-short text-xl" id="sorting-icon-1"></i>
                  </button>
                </th>
                <th>Number of tickets</th>
                <th>Category</th>
                <th>Ordered at</th>
                <th>
                  <button class="text-center justify-center" id="sorting-button-2">
                    <span>Total price</span>
                    <i class="fa-solid fa-arrow-up-wide-short text-xl" id="sorting-icon-2"></i>
                  </button>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody class="tableBody">
            </tbody>
          </table>
        </section>
      </main>
    </div>
  `;
}

function setupNavigationEvents() {
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const href = link.getAttribute('href');
      navigateTo(href);
    });
  });
}

function setupMobileMenuEvent() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
}

function setupPopstateEvent() {
  window.addEventListener('popstate', () => {
    const currentUrl = window.location.pathname;
    renderContent(currentUrl);
  });
}

function setupInitialPage() {
  const initialUrl = window.location.pathname;
  renderContent(initialUrl);
}

 function setupFilterEvents(eventData){

    const nameFilterInput = document.querySelector('#filterInput');

    if(nameFilterInput){
      const filterInterval = 500;
      nameFilterInput.addEventListener('keyup', () =>{
        setTimeout(liveSearch(eventData), filterInterval);
      });
    }
   
}

function liveSearch(eventData){
  const filterInput = document.querySelector('#filterInput');
  
  if(filterInput){
    const searchValue = filterInput.value;

    if(searchValue !== undefined){
      const filteredEvents = eventData.filter((event) =>
        event.name.toLowerCase().includes(searchValue.toLowerCase())
        );
        addEvents(filteredEvents);
    }
  }
}

async function filterEventsByEventType(){

  const types = await fetchDataFromServer('http://localhost:8080/eventTypes')
  const eventTypeDropdown = document.querySelector('#selectType');

  const option = document.createElement('option');
    option.value = 0;
    option.textContent = "Filter by event type";
    eventTypeDropdown.appendChild(option);

  types.forEach((type) => {
    const option = document.createElement('option');
    option.value = type.eventTypeID;
    option.textContent = type.name;
    eventTypeDropdown.appendChild(option);
  });

  eventTypeDropdown.addEventListener('change', () => handleDropdowns());
}

async function filterEventsByVenue(){

  const venues = await fetchDataFromServer('http://localhost:8080/venues')

  const venueDropdown = document.querySelector('#selectVenue');

  const option = document.createElement('option');
    option.value = 0;
    option.textContent = "Filter By Venue";
    venueDropdown.appendChild(option);

  venues.forEach((venue) => {
    const option = document.createElement('option');
    option.value = venue.venueID;
    option.textContent = venue.location;
    venueDropdown.appendChild(option);
  });

  venueDropdown.addEventListener('change', () => handleDropdowns());
}

 async function handleDropdowns(){
  const filters = getFilters();
  console.log('filters',filters);

  try{
    const eventsDiv = document.querySelector('.events');
    eventsDiv.innerHTML = '<div class="mess">No events available</div>';
    const filteredEvents = await getEventsFilteredByVenueAndType(filters);
    if(filteredEvents.length){
      addEvents(filteredEvents);
    }
   
  }catch(error){
    console.error('Error fetching filtered events', error);
  }

}

const addEvents = (events) => {
  const eventsDiv = document.querySelector('.events');
  eventsDiv.innerHTML = '<div class="mess">No events available</div>';
  
  if(events.length){
    eventsDiv.innerHTML = '';
    events.forEach((event) =>{
      eventsDiv.appendChild(createEventCard(event));
    });
  }
};

async function fetchAndRenderEvents() {
  try {
    const eventData = await fetchDataFromServer('http://localhost:8080/events');

    setTimeout(() =>{
      removeLoader();
    }, 200);
    
    if (eventData !== null) {

      setupFilterEvents(eventData);
      filterEventsByVenue();
      filterEventsByEventType();

      const eventsContainer = document.querySelector('.events');
      console.log(eventsContainer);
      eventsContainer.innerHTML = ''; // Clear existing content

      eventData.forEach((eventDataItem) => {
        const eventCard = createEventCard(eventDataItem);
        console.log(eventCard);
        
        const addToCartBtn = eventCard.querySelector('.action');
        const input = eventCard.querySelector('.nr-tickets'); 
        input.addEventListener('blur', () => {
          if (!input.value) {
          input.value = 0;
        }
       });

       input.addEventListener('input',() =>{
        const quantity = parseInt(input.value);
        if(quantity > 0){
          addToCartBtn.disabled = false;
        }else{
          addToCartBtn.disabled = true;
        }
       });

        addToCartBtn.addEventListener('click', ()=>{
         const ticketNr = eventCard.querySelector('.nr-tickets');
         const ticketType = eventCard.querySelector('#ticketType');

        handleAddToCart(eventCard, eventData.eventId, ticketNr, input, ticketType);

       });

       const ticketTypeSelect = eventCard.querySelector('#ticketType');
       const priceParagraph = eventCard.querySelector('.price');

       ticketTypeSelect.addEventListener('change', function() {

         const selectedCategoryId = ticketTypeSelect.value;
         const selectedCategory = eventDataItem.ticketCategoriesForEvent.find(
          category => category.ticketCategoryId == selectedCategoryId
         );
  
        if (selectedCategory) {
            priceParagraph.innerHTML = `Price: $${selectedCategory.price}`;
        }
      });
      
        eventsContainer.appendChild(eventCard);
      });
    } else {
      // Handle the case when data fetch fails
      const eventsContainer = document.querySelector('.events');
      eventsContainer.innerHTML = 'Error fetching events';
    }
  } catch (error) {
    console.error(error);
  }
}

function createEventCard(eventData) {

  const eventCard = document.createElement('div');
 // eventCard.classList.add('event-card'); 

  const categoriesOptions = eventData.ticketCategoriesForEvent.map(
    (ticketCategory) => `<option value=${ticketCategory.ticketCategoryId}>${ticketCategory.description}</option>`
  );

  const contentMarkup = `
    <div class="container">
      <div class="card">
        <div class="img">
          <img class="imag-event" src=${getEventImageSrc(eventData.name)}>
        </div>
        <div class="top-text">
          <div class="name">${eventData.name}</div>
          <p>${eventData.description}</p>
        </div>
        <div class="details">
        <p class="data">${periodFormat(eventData.startDate,eventData.endDate)}</p>
        <p class = "event-location">${eventData.venue.location}</p>
        <div class="dropdown">
          <p class="chooseTicket">Choose Ticket Type:</p>
          <select id="ticketType" class="tickCat" name="ticketType">${categoriesOptions.join('\n')}</select>
        </div>
        <p class="price">Price: $${eventData.ticketCategoriesForEvent[0].price}</p>
        <div class="quantity">
          <p class="nr-of-tickets">Number of tickets: </p>
          <input id="inpTick" type="number" min=0 class="nr-tickets" value="0"></input>
        </div>
        <button class="action">Buy Now</button> 
        </div>
      </div>
    </div>
  `;

  eventCard.innerHTML = contentMarkup;  
  return eventCard;
}

async function fetchAndRenderOrders() {
  try {
    const orderData = await fetchDataFromServer('https://localhost:5001/api/OrderGetAll');
    const ticketCategories = await fetchDataFromServer('https://localhost:5001/api/TicketCategory');
    console.log('t',ticketCategories);

    setTimeout(() =>{
      removeLoader();
    }, 200);

    if (orderData !== null) {
      const ordersContainer = document.querySelector('.tableBody');
      ordersContainer.innerHTML = ''; // Clear existing content

       orderData.forEach((orderDataItem) =>  {

        const orderCard = createOrderCard(orderDataItem, ticketCategories);

        const editButton = orderCard.querySelector('.editButton');
        const deleteButton = orderCard.querySelector('.deleteButton');
        const saveButton = orderCard.querySelector('.saveButton');
        const cancelButton = orderCard.querySelector('.cancelButton');
        const nrTicketsField = orderCard.querySelector('#inpTicks');
        const ticketType = orderCard.querySelector('#ticketTypes');
        const price = orderCard.querySelector('.price');

        editButton.addEventListener('click',() =>{
          editHandler(editButton, deleteButton, saveButton, cancelButton, nrTicketsField, ticketType);
          console.log('clicked!');
        });

        deleteButton.addEventListener('click', () =>{
          deleteHandler(orderDataItem.orderId, orderCard);
        });

        const initialTicketCategoryId = ticketType.value;
        cancelButton.addEventListener('click', () =>{

          console.log('initial',initialTicketCategoryId);
          cancelHandler(editButton, saveButton, cancelButton, nrTicketsField, ticketType, orderDataItem, initialTicketCategoryId);
        });

        saveButton.addEventListener('click', () =>{
          saveHandler(nrTicketsField, ticketType, orderDataItem, price, saveButton, cancelButton, editButton);
        });

         ordersContainer.appendChild(orderCard); 
      });

      const sortOrdersByEventNameBtn = document.querySelector('#sorting-button-1');
      sortOrdersByEventNameBtn.addEventListener('click', () => {
        addLoader();
        sortOrdersByEventName(orderData, ticketCategories);
      });

      const sortOrdersByPriceBtn = document.querySelector('#sorting-button-2');
      sortOrdersByPriceBtn.addEventListener('click', () => {
        addLoader();
        sortOrdersByPrice(orderData, ticketCategories);
      });


    } else {
      // Handle the case when data fetch fails
      const ordersContainer = document.querySelector('.tableBody');
      ordersContainer.innerHTML = 'Error fetching orders';
    }
  } catch (error) {
    console.error(error);
  }
}


function createOrderCard(orderData, ticketCategories) {
  const orderCard = document.createElement('tr');
  orderCard.classList.add('order-row'); 

  console.log(orderData);

  const ticketCatForEvent = ticketCategories.filter(
    (t) => t.eventId === orderData.eventId
  );
  console.log('list',ticketCatForEvent);

  const categoriesOptions = ticketCatForEvent.map(
    (ticketCategory) => `<option value=${ticketCategory.ticketCategoryId} ${
      ticketCategory.ticketCategoryId === orderData.ticketCategoryId ? 'selected' : ''
    }>${ticketCategory.description}</option>`
  );



  const contentMarkup = `
    <td id="idOrder">${orderData.orderId}</td>
    <td><img src=${getEventImageSrc(orderData.eventName)}>${orderData.eventName}</td>
    <td><input id="inpTicks" type="number" min=1 class="nr-ticketss" value=${orderData.numberOfTickets} disabled></input></td>
    <td>
      <div class="dropdown">
        <select id="ticketTypes" class="tickCats" name="ticketTypes" disabled>${categoriesOptions.join('\n')}</select>
      </div>
    </td>
    <td>${dateFormat(orderData.orderedAt)}</td>
    <td class="price"> <strong>$${orderData.totalPrice}</strong></td>
    <td>
      <button class="editButton" id="editBtn">
        <i class="fa-solid fa-pencil"></i>
      </button> 
      <button class="saveButton hidden" id="saveBtn">
        <i class="fa-solid fa-check"></i>
      </button>
      <button class="cancelButton hidden" id="cancelBtn">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <button class="deleteButton" id="deleteBtn">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </td>
  `;

  orderCard.innerHTML = contentMarkup;
  return orderCard;
}

const addOrders = (orders, ticketCategories) => {
  const ordersDiv = document.querySelector('.tableBody');
  ordersDiv.innerHTML = '<div class="mess">No orders available</div>';
  
  if(orders.length){
    ordersDiv.innerHTML = '';
    orders.forEach((order) =>{
      ordersDiv.appendChild(createOrderCard(order, ticketCategories));
    });
  }
};

function sortOrdersByEventName(orderData, ticketCategories){

  orderData.sort((orderA, orderB) =>{
    const eventNameA = orderA.eventName.toUpperCase();
    const eventNameB = orderB.eventName.toUpperCase();


    if(eventNameA < eventNameB){
      return -1;
    }
    if(eventNameA > eventNameB){
      return 1;
    }
    return 0;
  });

  addOrders(orderData, ticketCategories);

  setTimeout(() =>{
    removeLoader();
  }, 200);
  
  
}

function sortOrdersByPrice(orderData, ticketCategories){

  orderData.sort((orderA, orderB) =>{
    const priceA = orderA.totalPrice;
    const priceB = orderB.totalPrice;

    if(priceA < priceB){
      return -1;
    }
    if(priceA > priceB){
      return 1;
    }
    return 0;
  });

  addOrders(orderData, ticketCategories);

  setTimeout(() =>{
    removeLoader();
  }, 200);
  
}

function renderHomePage() {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getHomePageTemplate();

  var words = ['Ready for a new adventure?', 'If YES', 'Then check out our new upcoming events',`Here’s to the nights that turned into mornings`,` and the friends that turned into family!`],
  part,
  i = 0,
  offset = 0,
  len = words.length,
  forwards = true,
  skip_count = 0,
  skip_delay = 15,
  speed = 70;
  var wordflick = function () {
  setInterval(function () {
  if (forwards) {
    if (offset >= words[i].length) {
      ++skip_count;
      if (skip_count == skip_delay) {
        forwards = false;
        skip_count = 0;
      }
    }
  }
  else {
    if (offset == 0) {
      forwards = true;
      i++;
      offset = 0;
      if (i >= len) {
        i = 0;
      }
    }
  }
  part = words[i].substr(0, offset);
  if (skip_count == 0) {
    if (forwards) {
     offset++;
    }
    else {
      offset--;
    }
  }
  $('.word').text(part);
  },speed);
  };

  $(document).ready(function () {
  wordflick();
  });

  addLoader();
  fetchAndRenderEvents();
}

function renderOrdersPage(categories) {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getOrdersPageTemplate();
  addLoader();
  fetchAndRenderOrders();
}

// Render content based on URL
function renderContent(url) {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = '';

  if (url === '/') {
    renderHomePage();
  } else if (url === '/orders') {
    renderOrdersPage()
  }
}

// Call the setup functions
setupNavigationEvents();
setupMobileMenuEvent();
setupPopstateEvent();
setupInitialPage();
