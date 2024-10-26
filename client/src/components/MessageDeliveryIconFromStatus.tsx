import { ChatDeliveryStatus } from "@/definitions/enums";
import { Check, CheckCheck, Clock5, RotateCcw } from "lucide-react";

/**
 * Returns the icon corresponding to the given chat delivery status.
 * @param {ChatDeliveryStatus} deliveryStatus - The delivery status of the chat message.
 * @returns {string|null} The URL of the icon corresponding to the delivery status, or null if no icon is found.
 */
const iconFromDeliveryStatus = (deliveryStatus: ChatDeliveryStatus) => {
  switch (deliveryStatus) {
    // If the message is unsent, return the URL for the waiting-retry icon.
    case ChatDeliveryStatus.Sending:
      return <Clock5 className="h-4" />;
    // If the message is sent but not yet delivered, return the URL for the single-tick icon.
    case ChatDeliveryStatus.Sent:
      return <Check className="h-4" />;
    // If the message is delivered but not yet read, return the URL for the double-tick icon.
    case ChatDeliveryStatus.Delivered:
      return <CheckCheck className="h-4" />;
    // If the message is delivered and read, return the URL for the blue-tick icon.
    case ChatDeliveryStatus.DeliveredRead:
      return <CheckCheck className="h-4 text-blue-500" />;
    // If the message delivery status is unknown or invalid, return null.
    case ChatDeliveryStatus.Failed:
      return <RotateCcw className="text-red-400 h-4" />;
    default:
      return null;
  }
};

const MessageDeliveryIconFromStatus = ({
  deliveryStatus,
}: {
  deliveryStatus: ChatDeliveryStatus;
}) => {
  return iconFromDeliveryStatus(deliveryStatus);
};

export default MessageDeliveryIconFromStatus;
