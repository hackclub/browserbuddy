import { temp } from "three/tsl";

const notifications_container = document.getElementById("notifications");
const notification_template = document.getElementById("notification-template");

export function notify(title, description) {
  let template = notification_template.content.cloneNode(true);
  let notification = template.get_slot("notification");
  template.get_slot("title").innerText = title;
  template.get_slot("description").innerText = description;
  template.get_slot("close").addEventListener("click", () => {
    notifications_container.removeChild(notification);
  });
  notifications_container.appendChild(template);

  setTimeout(() => {
    notifications_container.removeChild(notification);
  }, 8000);
}
