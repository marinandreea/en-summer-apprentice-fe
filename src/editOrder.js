import { addLoader, removeLoader } from "./loader";
import { deleteOrder } from "./deleteOrder";

export function updateOrder(orderID, newNrOfTickets, newTicketType){
   return fetch('https://localhost:5001/api/OrderPatch',{
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body:JSON.stringify({
            orderId:+orderID,
            ticketCategoryId:+newTicketType,
            numberOfTickets:+newNrOfTickets,
          })
    }).then((res) =>{
        if(res.status === 200){
            toastr.success("Order was successfully updated!");
        }else{
            toastr.error("Error updating order!");
        }
        
        return res;
    }).catch((err) =>{
        throw new Error(err);
    })
}

export function editHandler(editButton, deleteButton, saveButton, cancelButton, nrTicketsField, ticketType){

    if (saveButton.classList.contains('hidden') && cancelButton.classList.contains('hidden')) {
      saveButton.classList.remove('hidden');
      cancelButton.classList.remove('hidden');
      editButton.classList.add('hidden');
      nrTicketsField.disabled = false; 
      ticketType.disabled = false;
    }
   
  }
  
  export function deleteHandler(orderId, orderCard){
    deleteOrder(orderId, orderCard);
  }
  
  export function cancelHandler(editButton, saveButton,cancelButton, nrTicketsField, ticketType, orderData, initialTicketCategoryId){
    saveButton.classList.add('hidden');
    cancelButton.classList.add('hidden');
    editButton.classList.remove('hidden');
    nrTicketsField.disabled = true;
    ticketType.disabled = true;
  
    nrTicketsField.value = orderData.numberOfTickets;
    console.log(orderData.numberOfTickets);
  
    Array.from(ticketType.options).forEach(function (element, index) {
      if (element.value == initialTicketCategoryId) {
        console.log(element.value);
        ticketType.selectedIndex = index;
        return;
      }
    });
  }
  
  export function saveHandler(nrTicketsField, ticketType, orderData, price, saveButton, cancelButton, editButton){
  
    const newNrOfTickets = nrTicketsField.value;
    const newTicketType = ticketType.value;
  
    if(newNrOfTickets != orderData.numberOfTickets || newTicketType != orderData.ticketCategoryId){
      addLoader();
      updateOrder(orderData.orderId, newNrOfTickets, newTicketType)
        .then((res) =>{
          if(res.status === 200){
            res.json().then((data) =>{
              orderData = data;
              price.innerHTML = `<strong>$${orderData.totalPrice}</strong>`;
  
            });
          }
        })
        .catch((err) =>{
          console.error(err);
        })
        .finally(() =>{
          setTimeout(() =>{
            removeLoader();
          }, 200);
        });
    }
  
    saveButton.classList.add('hidden');
    cancelButton.classList.add('hidden');
    editButton.classList.remove('hidden');
    nrTicketsField.disabled = true; 
    ticketType.disabled = true;
  
  }