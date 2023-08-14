<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Quasar App
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Essential Links
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container class="text-center">
      <q-btn v-if="!pwaIsInstalled" @click="installApp" label="install" name="install" icon="install_mobile" class="icon-size q-mt-lg"/>

      <div v-if="wsData" class="q-px-xl q-mt-md">
        <div>Data from WS</div>
        <pre class="text-left">{{ wsData }}</pre>
      </div>


      <router-view />

    </q-page-container>
  </q-layout>
</template>

<script>
import {computed, defineComponent, onMounted, ref} from 'vue'
import EssentialLink from 'components/EssentialLink.vue'

const linksList = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev'
  },
  {
    title: 'Github',
    caption: 'github.com/quasarframework',
    icon: 'code',
    link: 'https://github.com/quasarframework'
  },
  {
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'https://chat.quasar.dev'
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev'
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev'
  },
  {
    title: 'Facebook',
    caption: '@QuasarFramework',
    icon: 'public',
    link: 'https://facebook.quasar.dev'
  },
  {
    title: 'Quasar Awesome',
    caption: 'Community Quasar projects',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev'
  }
]

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink
  },

  setup () {
    const wsData = ref(null)
    const leftDrawerOpen = ref(false)
    const deferredPrompt = ref(null)

    const browserType = () => {
      const userAgent = navigator.userAgent
      let browserName

      // https://codepedia.info/detect-browser-in-javascript#:~:text=To%20detect%20user%20browser%20information,to%20identify%20the%20user%20browser.&text=Now%20call%20this%20JS%20function,browser%20name%20on%20page%20load.
      if (userAgent.match(/chrome|chromium|crios/i)) {
        browserName = 'chrome'
      } else if (userAgent.match(/firefox|fxios/i)) {
        browserName = 'firefox'
      } else if (userAgent.match(/safari/i)) {
        browserName = 'safari'
      } else if (userAgent.match(/opr\//i)) {
        browserName = 'opera'
      } else if (userAgent.match(/edg/i)) {
        browserName = 'edge'
      } else {
        browserName = 'No browser detection'
      }

      return browserName
    }

    onMounted(async () => {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        deferredPrompt.value = e
      })

      window.addEventListener('message', e => {
        if (e.data?.type === 'ws') {
          wsData.value = e.data?.data
        }
      })

      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.addEventListener("updatefound", () => {
          console.log("Service Worker update found!");
        });
      }
    })

    const installApp = async () => {
      if (!deferredPrompt.value) {
        return alert('deferredPrompt is null')
      }
      deferredPrompt.value.prompt()
      const { outcome } = await deferredPrompt.value.userChoice

      if (outcome === 'dismissed') {
        console.log(`User response to the install prompt: ${outcome}`)
        deferredPrompt.value = null
        return ''
      }
    }

    const pwaIsInstalled = computed(() => {
      return window.matchMedia('(display-mode: standalone)').matches;
    })

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      browserType,
      deferredPrompt,
      pwaIsInstalled,
      installApp,
      wsData
    }
  }
})
</script>
