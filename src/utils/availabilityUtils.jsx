import moment from "moment";

/**
 * Calculate quote based on service type and slot duration.
 */
export const calculateQuote = (service, slot) => {
  const { price, priceType } = service;
  if (priceType === "perHour" && slot) {
    const fromTime = moment(slot.from, "h:mm a");
    const toTime = moment(slot.to, "h:mm a");
    const duration = moment.duration(toTime.diff(fromTime));
    const hours = duration.asHours();
    return parseFloat((hours * price).toFixed(2));
  }
  return parseFloat(price);
};

/**
 * Generate counter offers based on a base price.
 */
export const generateCounterOffers = (basePrice) => {
  return [
    (basePrice * 0.9).toFixed(2),
    (basePrice * 0.95).toFixed(2),
    (basePrice * 1.05).toFixed(2),
  ];
};

/**
 * Get available slots for a specific date based on weekly or specific date availability.
 */
export const getSlotsForDate = (selectedService, date) => {
  if (!selectedService || selectedService?.priceType === "fixed") return [];

  const dayName = date.toLocaleString("default", { weekday: "long" });
  const dateString = date.toISOString().split("T")[0];

  const weeklyAvailability = selectedService.availability.find(
    (week) => week.day === dayName
  );
  if (weeklyAvailability) return weeklyAvailability.slots;

  const specificDateAvailability = selectedService.availability.find(
    (spec) => spec.date === dateString
  );
  if (specificDateAvailability) return specificDateAvailability.slots;

  return [];
};

/**
 * Get all available dates for a service's availability.
 */
export const getAvailableDates = (selectedService) => {
  if (!selectedService) return new Set();

  const availableDates = new Set();
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Add weekly availability
  selectedService.availability.forEach((avail) => {
    const dayIndex = daysOfWeek.indexOf(avail.day);
    if (dayIndex !== -1) {
      const today = new Date();
      const year = today.getFullYear();

      // Iterate over the next 12 months to add dates based on weekly availability
      for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
        const monthDate = new Date(
          today.getFullYear(),
          today.getMonth() + monthOffset,
          1
        );
        const daysInMonth = new Date(
          monthDate.getFullYear(),
          monthDate.getMonth() + 1,
          0
        ).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(
            monthDate.getFullYear(),
            monthDate.getMonth(),
            day
          );
          if (date.getDay() === dayIndex) {
            availableDates.add(date.toISOString().split("T")[0]);
          }
        }
      }
    } else if (avail.date) {
      // Add specific date availability
      availableDates.add(avail.date);
    }
  });

  return availableDates;
};
