import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const token = localStorage.getItem("token");

const echo = new Echo({
  broadcaster: "pusher",
  key: "dd9d4765fc958213199b",
  cluster: "ap1",
  forceTLS: true,
  authEndpoint: "http://122.53.61.91:6002/api/broadcasting/auth",
  auth: {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
});

export default echo;