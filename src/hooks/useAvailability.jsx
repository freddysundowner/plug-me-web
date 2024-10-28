import { useState } from "react";
import {
  calculateQuote,
  generateCounterOffers,
  getSlotsForDate,
  getAvailableDates,
} from "../utils/availabilityUtils";

const useAvailability = (initialService) => {
  const [selectedService, setSelectedService] = useState(initialService);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [date, setDate] = useState(null);
  const [quote, setQuote] = useState(null);
  const [counterOffers, setCounterOffers] = useState([]);
  const [finalQuote, setFinalQuote] = useState(null);

  const handleServiceChange = (service) => {
    setSelectedService(service);
    setSelectedSlot(null);
    setQuote(null);
    setCounterOffers([]);
    setFinalQuote(null);
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSelectedSlot(null);
    setQuote(null);
    setFinalQuote(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    if (selectedService) {
      const calculatedQuote = calculateQuote(selectedService, slot);
      setQuote(calculatedQuote);
      setCounterOffers(generateCounterOffers(calculatedQuote));
    }
  };

  const handleCounterOfferSelect = (offer) => {
    setFinalQuote(parseFloat(offer));
  };

  const slotsForDate =
    date && selectedService ? getSlotsForDate(selectedService, date) : [];

  return {
    selectedService,
    selectedSlot,
    date,
    quote,
    counterOffers,
    finalQuote,
    slotsForDate,
    handleServiceChange,
    handleDateChange,
    handleSlotSelect,
    handleCounterOfferSelect,
  };
};

export default useAvailability;
