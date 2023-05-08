<!-- eslint-disable vuejs-accessibility/anchor-has-content -->
<template>
  <v-container class="text-center">
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
              <v-btn @click="clickJoinGame">join game</v-btn>
            </v-form>
          </v-sheet>
        </v-dialog>
      </v-btn>
    </v-row>
    <v-row class="my-3">
      <!-- TODO click 2 open betting dialog, badge result -->
      <v-col
        v-for="animal in ANIMAL_DISPLAY"
        :key="animal.id"
        cols="4"
        class="mb-5"
      >
        <v-badge :value="false">
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
              </v-list-item-title>
            </v-list-item-content>

            <!-- <div
              v-for="animalId in Object.keys(player2Display[playerId].animals)"
              :key="animalId"
            > -->
            <v-badge
              v-for="animalId in Object.keys(betUser2Animal[userId] || {})"
              :key="animalId"
              :content="betUser2Animal[userId][animalId]"
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
    <v-row>
      <!-- {{ currentUserID }}
      {{ JSON.stringify(betAnimal2User) }} -->
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { state, joinGame } from '@/socket';
// types
import type { RegisterUser } from '@/interfaces/UserInterface';
import { ANIMAL_DISPLAY, SAMPLE_AVA_SRCS } from '@/constants';

/** HelloWorld Component */
const users = computed(() => state.users);
// the current user
const currentUserID: string | null = null;
// computed displays
// bet results display
const betUser2Animal = computed(() => state.betUser2Animal);
const betAnimal2User = computed(() => state.betAnimal2User);
const registerDialog = ref(false);
const registerInfo: RegisterUser = reactive({
  name: '',
  avaSrc: '',
});

const isJoin = computed(() => state.isJoin);
const nameRules = [
  (v: string) => !!v || 'Name is required',
  (v: string) =>
    (v && v.length <= 10) || 'Name must be less than 10 characters',
];
const clickJoinGame = () => {
  joinGame(registerInfo);
};
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
