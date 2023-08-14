 

import { addLoader,removeLoader } from "./loader";
export async function fetchDataFromServer(url) {
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

  export const periodFormat = (startDate, endDate) =>{
    var trimmedStartDate = startDate.split('T')
    var trimmedEndDate = endDate.split('T')
    var period = trimmedStartDate[0] + ' -> ' + trimmedEndDate[0];
    return period;
  };

  export function getEventImageSrc(name) {
    switch (name) {
      case 'Untold':
        return './src/assets/untold.jpg';
      case 'Electric Castle':
        return './src/assets/ec.jpg';
      case 'Fotbal':
        return './src/assets/football.jpg';
      case 'Festival de vin':
        return './src/assets/wine.jpg';
      default:
        return './src/assets/wine.jpg'; 
    }
  }

  export const handleAddToCart = (eventCard, eventID, nrTickets, input, ticketType) => {
  
    const selectedType = ticketType.value;
    console.log(selectedType);
    const numberOfTicketss= nrTickets.value;
    if(parseInt(numberOfTicketss)){
      addLoader();
      fetch(`http://localhost:8080/orders`, {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body:JSON.stringify({
          eventId:+eventID,
          ticketCategoryId:+selectedType,
          numberOfTickets:+numberOfTicketss,
        }),
      })
      .then((data) =>{
        input.value = 0;
        const ticketType = eventCard.querySelector('#ticketType');
        ticketType.selectedIndex = 0;  
        toastr.success("Order placed successfully!");
      })
      .catch(error =>{
        toastr.error("Order could not be created!");
      })
      .finally(() =>{
        removeLoader();
      });  
    }else{
      toastr.error("Please fill in the field with a number!");
    }
  }

  