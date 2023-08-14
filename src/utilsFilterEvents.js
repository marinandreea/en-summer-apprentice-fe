export function getEventsFilteredByVenueAndType(filters){
  
    const queryParams = new URLSearchParams(filters).toString();
    console.log(queryParams);
    const result = fetch(`http://localhost:8080/events?${queryParams}`,{
      method: 'GET',
      headers: {
        'Content-type': 'application-json',
      },
    })
    .then((res) => res.json())
    .then((data) =>{
      return [...data];
   });
    return result;
  }

 export function getFilters(){
  
    const venueDropdown = document.querySelector('#selectVenue');
    const venueIdFilter = venueDropdown.value;
    
    const eventTypeDropdown = document.querySelector('#selectType');
    const selectedTypeId = eventTypeDropdown.value;
    const eventTypeFilter = eventTypeDropdown.options[ eventTypeDropdown.selectedIndex].text;
  
    if(venueIdFilter == 0 && selectedTypeId != 0){
      return {
        eventType: eventTypeFilter,
      };
    }else if(venueIdFilter != 0 && selectedTypeId == 0){
        return {
          venueId: parseInt(venueIdFilter),
        };
    }else if(venueIdFilter == 0 && selectedTypeId == 0){
      return {};
    }else{
      return {
        venueId : parseInt(venueIdFilter),
        eventType: eventTypeFilter, 
      };
    } 
  
  }

 

  

 
  
  
