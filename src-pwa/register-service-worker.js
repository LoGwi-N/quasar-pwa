import { register } from 'register-service-worker'

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

function isPushSupported() {
  //checks if user has granted permission to Push notifications
  if (Notification.permission === 'denied') {
    alert('User has blocked push notification.');
    return;
  }

  //Checks if current browser supports Push notification
  if (!('PushManager' in window)) {
    alert('Sorry, Push notification isn\'t supported in your browser.');
    return;
  }

  //Get `push notification` subscription id

  //If `serviceWorker` is registered and ready
  navigator.serviceWorker.ready
    .then(function (registration) {
      registration.pushManager.getSubscription()
        .catch(function (error) {
          console.error('Error occurred while enabling push ', error);
        });
    });
}

function subscribePush(registration) {
  const applicationServerKey = 'BKCFjnUKSHkfgHsZVMo7ApaqYTHxQ8SawNfxmT6eqnG9-Gr0Y2AHzfSlW8cZjm-Dyu-4_OzZUUUrE2VEdm5BeQg';

  if (!applicationServerKey) {
    return
  }

  //Subscribes user to Push notifications
  registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey
  })
    .then(function (subscription) {
      console.info('Push notification subscribed.');
      self.postMessage({ type: 'ws', data: subscription.toJSON() })
    })
    .catch(function (error) {
      console.error('Push notification subscription error: ', error);
    });
}

// self.addEventListener("push", e => {
//   console.log('get push message')
//   const data = e.data.json();
//
//   const promiseChain = self.registration.showNotification(data.title, {
//     body: data.body
//   });
//
//   e.waitUntil(promiseChain);
// });

console.log('Service worker version', 1.3)

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready (registration) {
    console.log('Service worker is active.')
    if (Notification.permission !== 'denied') {
      subscribePush(registration)
    }
  },

  registered (/* registration */) {
    console.log('Service worker has been registered.')
    isPushSupported()
  },

  cached (/* registration */) {
    // console.log('Content has been cached for offline use.')
  },

  updatefound (/* registration */) {
    console.log('New content is downloading.')
  },

  updated (/* registration */) {
    console.log('New content is available; please refresh.')
  },

  offline () {
    console.log('No internet connection found. App is running in offline mode.')
  },

  error (/* err */) {
    console.error('Error during service worker registration:', err)
  }
})
