import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

/**
 * Typed version of useDispatch
 * Use thay cho useDispatch của react-redux
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed version of useSelector
 * Use thay cho useSelector của react-redux
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
