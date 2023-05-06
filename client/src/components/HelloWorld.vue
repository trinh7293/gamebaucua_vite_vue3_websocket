<!-- eslint-disable vuejs-accessibility/anchor-has-content -->
<template>
  <v-container class="text-center">
    <v-dialog v-model="betDialog">
      <v-card>
        <v-card-title>
          <span class="text-h5">Bet for {{ currentBetAnimal?.name }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="curBetVal"
                  type="number"
                  label="Enter value here"
                  required
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="blue-darken-1" variant="text" @click="closeBetDialog">
            Close
          </v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="addBetItem">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-row class="my-3">
      <v-col
        v-for="animalId in Object.keys(animal2Display)"
        :key="animalId"
        cols="4"
        class="mb-5"
        @click="openBettingDialog(animalId)"
      >
        <v-badge
          :content="gameState.animalCount[animalId]"
          :value="gameState.animalCount[animalId] > 0"
        >
          <v-img
            :src="animalComputed[animalId].avaSrc"
            class="mx-auto logo vue"
            :alt="animalComputed[animalId].avaAlt"
            contain
            width="200"
            height="200"
          />
        </v-badge>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="3">
        <v-btn @click="genNewRe">Play</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-list subheader>
          <v-subheader>Players</v-subheader>

          <v-list-item
            v-for="playerId in Object.keys(player2Display)"
            :key="playerId"
          >
            <v-list-item-avatar>
              <v-img
                :alt="`${playerComputed[playerId].title} avatar`"
                :src="playerComputed[playerId].avatar"
              />
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>
                {{ playerComputed[playerId].title }}
              </v-list-item-title>
            </v-list-item-content>

            <!-- <div
              v-for="animalId in Object.keys(player2Display[playerId].animals)"
              :key="animalId"
            > -->
            <v-badge
              v-for="animalId in Object.keys(player2Display[playerId].animals)"
              :key="animalId"
              :content="player2Display[playerId].animals[animalId]"
              inline
            >
              <v-list-item-avatar>
                <v-img
                  :alt="`${animalComputed[animalId].avaAlt} avatar`"
                  :src="animalComputed[animalId].avaSrc"
                />
              </v-list-item-avatar>
            </v-badge>
            <v-list-item-content>
              <v-list-item-title>
                {{ player2Display[playerId].winAmount }}
              </v-list-item-title>
            </v-list-item-content>
            <!-- </div> -->

            <!-- <v-list-item-icon>
              <v-icon :color="chat.active ? 'deep-purple accent-4' : 'grey'">
                mdi-message-outline
              </v-icon>
            </v-list-item-icon> -->
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed } from 'vue';

// types
import type AnimalItem from '@/interfaces/AnimalInterface';
import type Player from '@/interfaces/PlayerInterface';
import type { GameState } from '@/interfaces/GameInterface';

// Logo
import vueLogo from '@/assets/vue.svg';
import viteLogo from '@/assets/vite.svg';
import vuetifyLogo from '@/assets/vuetify.svg';
import crabLogo from '@/assets/crab.svg';
import fishLogo from '@/assets/fish.svg';
import shrimpLogo from '@/assets/shrimp.svg';
import type { ComputedRef, Ref } from 'vue';
// the number of dices to gen the result
const NUM_GEN = 3;

// types
interface PlayerDisplay {
  [key: string]: {
    animals: {
      [key: string]: number;
    };
    winAmount: number;
  };
}
interface AnimalDisplay {
  [key: string]: {
    players: {
      [key: string]: number;
    };
  };
}

/** HelloWorld Component */
export default defineComponent({
  props: {
    /** Message */
    msg: { type: String, default: undefined },
  },
  setup() {
    const animals: AnimalItem[] = [
      {
        id: '0',
        name: 'vite',
        avaSrc: viteLogo,
        avaAlt: 'Vite Logo',
      },
      {
        id: '1',
        name: 'vue',
        avaSrc: vueLogo,
        avaAlt: 'Vue Logo',
      },
      {
        id: '2',
        name: 'vuetify',
        avaSrc: vuetifyLogo,
        avaAlt: 'Vuetify Logo',
      },
      {
        id: '3',
        name: 'shrimp',
        avaSrc: shrimpLogo,
        avaAlt: 'shrimp Logo',
      },
      {
        id: '4',
        name: 'fish',
        avaSrc: fishLogo,
        avaAlt: 'fish logo',
      },
      {
        id: '5',
        name: 'crab',
        avaSrc: crabLogo,
        avaAlt: 'Crab Logo',
      },
    ];
    const players: Player[] = [
      {
        id: '0',
        avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
        title: 'Jason Oner',
      },
      {
        id: '1',
        avatar: 'https://cdn.vuetifyjs.com/images/lists/2.jpg',
        title: 'Mike Carlson',
      },
      {
        id: '2',
        avatar: 'https://cdn.vuetifyjs.com/images/lists/3.jpg',
        title: 'Cindy Baker',
      },
      {
        id: '3',
        avatar: 'https://cdn.vuetifyjs.com/images/lists/4.jpg',
        title: 'Ali Connors',
      },
    ];
    // the current user
    const currentPlayer: Ref<Player | undefined> = ref({
      id: '0',
      avatar: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
      title: 'Jason Oner',
    });
    // the bets value from server
    // {[playerId]: {[animalId]: betAmount}}
    const playerBets: Ref<Record<string, Record<string, number>>> = ref({
      '0': {
        '2': 3000,
        '4': 15000,
      },
      '1': {
        '3': 3000,
        '0': 15000,
      },
    });
    // computed value for accessing value
    const animalComputed: ComputedRef<Record<string, Omit<AnimalItem, 'id'>>> =
      computed(() => {
        const val: Record<string, Omit<AnimalItem, 'id'>> = {};
        animals.forEach(an => {
          const { id, ...rest } = an;
          val[an.id] = rest;
        });
        return val;
      });
    const playerComputed: ComputedRef<Record<string, Omit<Player, 'id'>>> =
      computed(() => {
        const val: Record<string, Omit<Player, 'id'>> = {};
        players.forEach(p => {
          const { id, ...rest } = p;
          val[p.id] = rest;
        });
        return val;
      });
    // computed displays
    // player object displayed {[playerId]: {animalBets: {[animalId]: betAmount}}}
    const player2Display: ComputedRef<PlayerDisplay> = computed(() => {
      const val: PlayerDisplay = {};
      players.forEach(p => {
        if (playerBets.value[p.id]) {
          let winAmount = 0;
          Object.keys(playerBets.value[p.id]).forEach(animalId => {
            const winTime = gameState.animalCount[animalId] || -1;
            winAmount += winTime * playerBets.value[p.id][animalId];
          });
          val[p.id] = { animals: playerBets.value[p.id], winAmount };
        } else {
          val[p.id] = { animals: {}, winAmount: 0 };
        }
      });
      return val;
    });
    // animal object displayed {[animalId]: {players: {[playerId]: betAmount}}}
    const animal2Display: ComputedRef<AnimalDisplay> = computed(() => {
      const val: AnimalDisplay = {};
      const plBetVal = playerBets.value;
      animals.forEach(an => {
        val[an.id] = { players: {} };
      });
      Object.keys(plBetVal).forEach(playerId => {
        Object.keys(plBetVal[playerId]).forEach(animalId => {
          val[animalId].players[playerId] = plBetVal[playerId][animalId];
        });
      });
      // animals.for
      return val;
    });
    // result for each game
    const gameState: GameState = reactive({
      animalCount: {},
      userBetItems: {},
    });
    // generate new result
    const genNewRe = () => {
      const reArr: { [key: number]: number } = {};
      for (const _ of Array(NUM_GEN)) {
        // generated result
        const genRe = Math.floor(Math.random() * animals.length);
        if (reArr[genRe]) {
          reArr[genRe]++;
        } else {
          reArr[genRe] = 1;
        }
      }
      gameState.animalCount = reArr;
    };
    // dialog for input amount of money to bet to one animal
    const betDialog = ref(false);
    // current animal choosed when opening betting dialog
    const currentBetAnimal: Ref<AnimalItem | undefined> = ref(undefined);
    // open betting dialog, then set current betting animal
    const openBettingDialog = (animalId: string) => {
      betDialog.value = true;
      const chosenAnimal = animals.find(an => an.id === animalId);
      currentBetAnimal.value = chosenAnimal;
      curBetVal.value = gameState.userBetItems[animalId] || 0;
    };
    // current bet value
    const curBetVal = ref(0);
    // close bet dialog
    const closeBetDialog = () => {
      betDialog.value = false;
    };
    // add bet item
    const addBetItem = () => {
      if (!currentBetAnimal.value) {
        console.log('current bet animal not set');
        return;
      }
      if (!currentPlayer.value) {
        console.log('current player not set');
        return;
      }
      gameState.userBetItems[currentBetAnimal.value.id] = +curBetVal.value;
      betDialog.value = false;
    };
    return {
      vueLogo,
      viteLogo,
      vuetifyLogo,
      crabLogo,
      fishLogo,
      shrimpLogo,
      players,
      animals,
      gameState,
      betDialog,
      currentBetAnimal,
      curBetVal,
      currentPlayer,
      playerBets,
      animalComputed,
      playerComputed,
      player2Display,
      animal2Display,
      genNewRe,
      openBettingDialog,
      addBetItem,
      closeBetDialog,
    };
  },
});
</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.logo.vuetify:hover {
  filter: drop-shadow(0 0 2em #2196f3aa);
}
</style>
