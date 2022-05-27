import { InjectionKey } from 'vue';
import { State } from '@/model/state';

export const stateKey: InjectionKey<State> = Symbol();