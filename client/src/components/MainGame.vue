<!-- eslint-disable vuejs-accessibility/anchor-has-content -->
<template>
  <v-container class="text-center">
    <v-dialog v-model="betDialog">
      <v-card>
        <!-- <v-card-title>
          <span class="text-h5">Bet for {{ currentBetAnimal?.name }}</span>
        </v-card-title> -->
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="bettingInfo.betAmount"
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
    <v-row v-if="!isJoin">
      <v-btn
        color="primary"
        @click="
          () => {
            registerDialog = true;
          }
        "
      >
        Join game
        <v-dialog v-model="registerDialog" persistent>
          <v-sheet width="auto" class="mx-auto">
            <v-avatar v-if="registerInfo.avaSrc">
              <v-img :src="registerInfo.avaSrc" alt="avatar" />
            </v-avatar>
            <v-form ref="form">
              <v-text-field
                v-model="registerInfo.name"
                :counter="10"
                :rules="nameRules"
                label="Name"
                required
              />
              <v-menu>
                <template #activator="{ on }">
                  <v-btn color="primary" dark v-on="on">Dropdown</v-btn>
                </template>
                <v-list>
                  <v-list-item
                    v-for="(avaSrc, index) in SAMPLE_AVA_SRCS"
                    :key="index"
                    :value="index"
                    @click="
                      () => {
                        registerInfo.avaSrc = avaSrc;
                      }
                    "
                  >
                    <v-list-item-avatar>
                      <v-img :src="avaSrc" :alt="avaSrc" />
                    </v-list-item-avatar>
                  </v-list-item>
                </v-list>
              </v-menu>
              <v-btn
                @click="
                  () => {
                    joinGame(registerInfo);
                  }
                "
              >
                join game
              </v-btn>
            </v-form>
          </v-sheet>
        </v-dialog>
      </v-btn>
    </v-row>
    <v-row v-if="isJoin && !isReady && !isResultGenerated">
      <v-btn @click="confirmBet">Confirm Betting</v-btn>
    </v-row>
    <v-row v-if="isJoin && isReady">Confirmed</v-row>
    <v-row v-if="isResultGenerated && isReady">
      <v-btn @click="wantResetGame">Wanna reset game</v-btn>
    </v-row>
    <v-row v-if="isJoin && !isReady">
      <p v-if="isResultGenerated">Waiting other players for new game</p>
      <p v-else>Betting</p>
    </v-row>
    <v-row class="my-3">
      <!-- TODO click 2 open betting dialog, badge result -->
      <v-col
        v-for="animal in ANIMAL_DISPLAY"
        :key="animal.id"
        cols="4"
        class="mb-5"
        @click="
          () => {
            openBettingDialog(animal.id);
          }
        "
      >
        <v-badge
          :value="!!resultBet[animal.id]"
          :content="resultBet[animal.id]"
        >
          <v-img
            :src="animal.avaSrc"
            class="mx-auto logo vue"
            :alt="animal.avaAlt"
            contain
            width="200"
            height="200"
          />
        </v-badge>
      </v-col>
    </v-row>
    <v-row v-if="users && isJoin">
      <v-col cols="12">
        <v-list subheader>
          <v-subheader>Players</v-subheader>
          <v-list-item v-for="userId in Object.keys(users || {})" :key="userId">
            <v-list-item-avatar>
              <v-img
                :alt="`${users[userId].name} avatar`"
                :src="users[userId].avaSrc"
              />
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>
                {{ users[userId].name }}
                {{ users[userId].isReady ? 'Confirmed' : 'Choosing' }}
                {{ users[userId].balance }}
              </v-list-item-title>
            </v-list-item-content>

            <!-- <div
              v-for="animalId in Object.keys(player2Display[playerId].animals)"
              :key="animalId"
            > -->
            <v-badge
              v-for="[animalId, betAmount] in _.toPairs(
                users[userId].betAnimal
              )"
              :key="animalId"
              :content="betAmount"
              inline
            >
              <v-list-item-avatar>
                <v-img
                  :alt="`${ANIMAL_DISPLAY[animalId].name} avatar`"
                  :src="ANIMAL_DISPLAY[animalId].avaSrc"
                />
              </v-list-item-avatar>
            </v-badge>
            <v-list-item-content>
              <!-- TODO winamount -->
              <!-- <v-list-item-title>
                {{ player2Display[playerId].winAmount }}
              </v-list-item-title> -->
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

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import {
  state,
  joinGame,
  betAction,
  confirmBet,
  wantResetGame,
} from '@/socket';
// types
import type { BetAnimal2User, RegisterUser } from '@/interfaces/UserInterface';
import { ANIMAL_DISPLAY, SAMPLE_AVA_SRCS } from '@/constants';
import type { ComputedRef } from 'vue';
import _ from 'lodash';
/** HelloWorld Component */
const users = computed(() => state.users);
// the current user
// const currentUserId: string | null = null;
const currentUserId = computed(() => state.currentUserId);
const isReady = computed(
  () => users.value?.[currentUserId.value || '']?.isReady || false
);
const isResultGenerated = computed(() => state.isResultGenerated);
// computed displays
// bet results display
const betAnimal2User: ComputedRef<BetAnimal2User> = computed(() => {
  const resu: BetAnimal2User = {};
  _.toPairs(users.value).forEach(([userId, user]) => {
    _.toPairs(user.betAnimal).forEach(([animalId, betAmount]) => {
      _.setWith(resu, `${animalId}.${userId}`, betAmount);
    });
  });
  return resu;
});
const resultBet = computed(() => state.resultBet);
const registerDialog = ref(false);
const registerInfo: RegisterUser = reactive({
  name: '',
  avaSrc: '',
});
// beting info for current player
const betDialog = ref(false);
const bettingInfo = reactive({
  animalId: '',
  betAmount: 1,
});
const closeBetDialog = () => {
  bettingInfo.animalId = '';
  bettingInfo.betAmount = 1;
  betDialog.value = false;
};
// add bet item
const addBetItem = () => {
  betAction(bettingInfo.animalId, bettingInfo.betAmount);
  betDialog.value = false;
};
const openBettingDialog = (animalId: string) => {
  if (!isJoin.value) {
    console.log('Plese join first');
    return;
  }
  if (isReady.value) {
    console.log('Bet result confirmed');
    return;
  }
  betDialog.value = true;
  bettingInfo.animalId = animalId;
  bettingInfo.betAmount =
    users.value[currentUserId.value || '']?.betAnimal[animalId] || 1;
};
const isJoin = computed(() => state.isJoin);
const nameRules = [
  (v: string) => !!v || 'Name is required',
  (v: string) =>
    (v && v.length <= 10) || 'Name must be less than 10 characters',
];
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
