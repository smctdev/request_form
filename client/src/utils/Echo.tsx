import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const initializeEcho = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("Bearer token is null or undefined");
    return null;
  }

  return new Echo({
    broadcaster: "pusher",
    key: "9775ee85a908d864d328",
    cluster: "mt1",
    forceTLS: true,
    authEndpoint: `${process.env.REACT_APP_API_BASE_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};

const echo = initializeEcho();

export default echo;
