import { fetchDataFromServer, periodFormat, getEventImageSrc, handleAddToCart } from "./src/utilsEvent";
import { getEventsFilteredByVenueAndType, getFilters } from "./src/utilsFilterEvents";
import { removeLoader,addLoader } from "./src/loader";

// Navigate to a specific URL
function navigateTo(url) {
  history.pushState(null, null, url);
  renderContent(url);
}
// HTML templates
function getHomePageTemplate() {
  return `
   <div id="content" >
       <img src="./src/assets/Endava.png" alt="summer">
      <div class="search">
        <input id="filterInput" type="text" placeholder="Filter by name" class="filter-events px-4 mt-4 mb-4 py-2 border"/>
      </div>
      <div class="dropdownVenue">
      <select id="selectVenue">
      </select>
      <div class="dropdownType">
      <select id="selectType">
      </select>
     </div>
      <div class="events flex items-center justify-center flex-wrap">
      </div>
      
    </div>
  `;
}

function getOrdersPageTemplate() {
  return `
    <div id="content">
    <h1 class="text-2xl mb-4 mt-8 text-center">Purchased Tickets</h1>
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
      eventsDiv.appendChild(createEventCard2(event));
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
        const eventCard = createEventCard2(eventDataItem);
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
  eventCard.classList.add('event-card'); 

  const categoriesOptions = eventData.ticketCategoriesForEvent.map(
    (ticketCategory) => `<option value=${ticketCategory.ticketCategoryId}>${ticketCategory.description}</option>`
  );

  const contentMarkup = `
    <div class="eventss>
      <div class="eventt">
        <img class="imag-event" src=${getEventImageSrc(eventData.name)}>
        <div class="event-info">
          <h4 class="event-title">${eventData.name}</h4>
          <p class = "event-description">${eventData.description}</p>
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

function createEventCard2(eventData) {

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

function renderHomePage() {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getHomePageTemplate();
  addLoader();
  fetchAndRenderEvents();
}

function renderOrdersPage(categories) {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getOrdersPageTemplate();
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
