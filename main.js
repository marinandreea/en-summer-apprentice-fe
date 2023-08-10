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
      eventsContainer.innerHTML = ''; // Clear existing content

      eventData.forEach((eventDataItem) => {
        const eventCard = createEventCard(eventDataItem);
        console.log(eventCard);
        const input = document.querySelector('.inpTick');
        console.log(input);
        // input.addEventListener('blur',()=>{
        //   if(!input.value){
        //     input.value=0;
        //   }
        //   console.log("aaa");
        // });
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
  // Add more image paths as needed
];

let imageIndex = 0;

function createEventCard(eventData) {
  const eventCard = document.createElement('div');
  eventCard.classList.add('event-card'); 

  console.log(eventData);

  const categoriesOptions = eventData.ticketCategoriesForEvent.map(
    (ticketCategory) => `<option value=${ticketCategory.ticketCategoryID}>${ticketCategory.description}</option>`
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
            <select id="ticketType" name="ticketType">${categoriesOptions.join('\n')}</select>
          </div>
          <div class="quantity">
            <button onclick="document.getElementById('inpTick').stepDown()">-</button>
            <input id="inpTick" type="number" class="nr-tickets" value="0">
            <button onclick="document.getElementById('inpTick').stepUp()">+</button>
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
