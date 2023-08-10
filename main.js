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

async function fetchDataFromServer(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Fetch error: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function fetchAndRenderEvents() {
  try {
    const eventData = await fetchDataFromServer('http://localhost:8080/events');

    if (eventData !== null) {
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

       const increaseBtn = eventCard.querySelector('.btn-plus');
       increaseBtn.addEventListener('click',() =>{
        const quantity = parseInt(input.value);
        if(quantity > 0){
          addToCartBtn.disabled = false;
        }else{
          addToCartBtn.disabled = true;
        }
       });

       const decreaseBtn = eventCard.querySelector('.btn-minus');
       decreaseBtn.addEventListener('click',() =>{
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

const periodFormat = (startDate, endDate) =>{
  var trimmedStartDate = startDate.split('T')
  var trimmedEndDate = endDate.split('T')
  var period = trimmedStartDate[0] + ' -> ' + trimmedEndDate[0];
  return period;
};

const imagePaths = [
  './src/assets/untold.jpg',
  './src/assets/ec.jpg',
  './src/assets/footbal.jpg',
  './src/assets/wine.jpg'
];

let imageIndex = 0;

function createEventCard(eventData) {

  const eventCard = document.createElement('div');
  eventCard.classList.add('event-card'); 

  const categoriesOptions = eventData.ticketCategoriesForEvent.map(
    (ticketCategory) => `<option value=${ticketCategory.ticketCategoryId}>${ticketCategory.description}</option>`
  );

  const contentMarkup = `
    <div class="eventss>
      <div class="eventt">
        <img class="imag-event" src=${imagePaths[imageIndex]}>
        <div class="event-info">
          <h4 class="event-title">${eventData.name}</h4>
          <p class = "event-description">${eventData.description}</p>
          <p class="data">${periodFormat(eventData.startDate,eventData.endDate)}</p>
          <p class = "event-location">${eventData.venue.location}</p>
          <div class="dropdown">
            <h2 class="chooseTicket">Choose Ticket Type:</h2>
            <select id="ticketType" class="tickCat" name="ticketType">${categoriesOptions.join('\n')}</select>
          </div>
          <div class="quantity">
            <button class="btn-minus" onclick="document.getElementById('inpTick').stepDown()">-</button>
            <input id="inpTick" type="number" min=0 class="nr-tickets" value="0">
            <button class="btn-plus" onclick="document.getElementById('inpTick').stepUp()">+</button>
          </div>
          <button class="action">Buy Now</button>
        </div>       
      </div>
    </div>
  `;

  eventCard.innerHTML = contentMarkup;  
  imageIndex++;
  return eventCard;
}

//POST
const handleAddToCart = (eventCard, eventID, nrTickets, input, ticketType) => {
  
  const selectedType = ticketType.value;
  console.log(selectedType);
  const numberOfTicketss= nrTickets.value;
  if(parseInt(numberOfTicketss)){
    fetch(`http://localhost:8080/orders`, {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
      },
      body:JSON.stringify({
        eventId:+eventID,
        ticketCategoryId:+selectedType,
        numberOfTickets:+numberOfTicketss,
      })
    });

    input.value = 0;
    const ticketType = eventCard.querySelector('#ticketType');
    ticketType.selectedIndex = 0;  
  }
}

function renderHomePage() {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getHomePageTemplate();
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
