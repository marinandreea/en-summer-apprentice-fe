
import { addLoader,removeLoader } from "./loader";

export function deleteOrder(orderId, orderCard) {
    addLoader();
  
    fetch(`https://localhost:5001/api/OrderDelete?id=${orderId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 204) {
          orderCard.remove();
          toastr.success('Order was successfully deleted!');
        } else {
          toastr.error('Error deleting the order!');
        }
      })
      .catch((e) => {
        console.error(e);
        toastr.error('Error deleting the order!');
      })
      .finally(() => {
        removeLoader();
      });
  }
  