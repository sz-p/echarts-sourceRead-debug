import Vue from 'vue';
import Vuex from 'vuex';
import { state } from './initialState';
import { mutations } from './mutations';

Vue.use(Vuex);

export const store = new Vuex.Store({
	state,
	mutations
});
