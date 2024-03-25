import { ChatDeliveryStatus } from "@/definitions/enums";

/**
 * Returns the icon URL corresponding to the given chat delivery status.
 * @param {ChatDeliveryStatus} deliveryStatus - The delivery status of the chat message.
 * @returns {string|null} The URL of the icon corresponding to the delivery status, or null if no icon is found.
 */
const iconUrlFromDeliveryStatus = (deliveryStatus: ChatDeliveryStatus) => {
  switch (deliveryStatus) {
    // If the message is unsent, return the URL for the waiting-retry icon.
    case ChatDeliveryStatus.Sending:
      return "/assets/waiting-timer.png";
    // If the message is sent but not yet delivered, return the URL for the single-tick icon.
    case ChatDeliveryStatus.Sent:
      return "/assets/single-tick.png";
    // If the message is delivered but not yet read, return the URL for the double-tick icon.
    case ChatDeliveryStatus.Delivered:
      return "/assets/double-tick.png";
    // If the message is delivered and read, return the URL for the blue-tick icon.
    case ChatDeliveryStatus.DeliveredRead:
      return "/assets/sent-tick.png";
    // If the message delivery status is unknown or invalid, return null.
    case ChatDeliveryStatus.Failed:
      return "/assets/retry.png";
    default:
      return null;
  }
};

export { iconUrlFromDeliveryStatus };
