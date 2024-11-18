import { EChatDeliveryStatus } from "@/definitions/enums";
import { IMessage } from "@/definitions/interfaces";
import { Check, CheckCheck, Clock5, RotateCcw } from "lucide-react";

/**
 * Returns the icon corresponding to the given chat delivery status.
 * @param {EChatDeliveryStatus} deliveryStatus - The delivery status of the chat message.
 * @returns {string|null} The URL of the icon corresponding to the delivery status, or null if no icon is found.
 */
const iconFromDeliveryStatus = (
  deliveryStatus: EChatDeliveryStatus,
  iconSize?: string
) => {
  const baseIconClass = iconSize || "h-4 w-4";
  switch (deliveryStatus) {
    // If the message is unsent, return the URL for the waiting-retry icon.
    case EChatDeliveryStatus.Sending:
      return <Clock5 className={baseIconClass} />;
    // If the message is sent but not yet delivered, return the URL for the single-tick icon.
    case EChatDeliveryStatus.Sent:
      return <Check className={baseIconClass} />;
    // If the message is delivered but not yet read, return the URL for the double-tick icon.
    case EChatDeliveryStatus.Delivered:
      return <CheckCheck className={baseIconClass} />;
    // If the message is delivered and read, return the URL for the blue-tick icon.
    case EChatDeliveryStatus.DeliveredRead:
      return <CheckCheck className={`${baseIconClass} text-blue-500`} />;
    // If the message delivery status is unknown or invalid, return null.
    case EChatDeliveryStatus.Failed:
      return <RotateCcw className={`${baseIconClass} text-red-400`} />;
    default:
      return null;
  }
};

const getMessageDeliveryStatus = (message: IMessage) => {
  const { sentAt, stats } = message || {};
  
  // Check if stats exists and has any entries
  if (!stats || Object.keys(stats).length === 0) {
    return EChatDeliveryStatus.Sent;
  }

  const deliveredToAllUsers = Object.values(stats).every(
    (stat) => !!stat.deliveredAt
  );

  const seenByAllUsers = Object.values(stats).every(
    (stat) => !!stat.readAt
  );

  if (!sentAt) {
    return EChatDeliveryStatus.Sending;
  }

  if (sentAt && !deliveredToAllUsers && !seenByAllUsers) {
    return EChatDeliveryStatus.Sent;
  }
  if (sentAt && deliveredToAllUsers && !seenByAllUsers) {
    return EChatDeliveryStatus.Delivered;
  }
  if (sentAt && deliveredToAllUsers && seenByAllUsers) {
    return EChatDeliveryStatus.DeliveredRead;
  }

  return EChatDeliveryStatus.Failed;
};

const MessageDeliveryIconFromStatus = ({
  message,
  iconSize,
}: {
  message: IMessage;
  iconSize?: string;
}) => {
  return (
    <div className={"flex-shrink-0"}>
      {iconFromDeliveryStatus(getMessageDeliveryStatus(message), iconSize)}
    </div>
  );
};

export default MessageDeliveryIconFromStatus;
