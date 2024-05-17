export function formatTimeAgo(time: Date): string {
  const now = new Date();
  const timeDiffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  // If the message was sent today, display the time
  if (isToday(time)) {
    return formatTime(time);
  }

  // If the message was sent yesterday, display "Yesterday"
  if (isYesterday(time)) {
    return "Yesterday";
  }

  // Otherwise, display the date
  return formatDate(time);
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatDate(date: Date): string {
  const options = { month: "short", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
}

//  Output: "12:30 PM" if sent today, "Mar 19" if sent on a different day
