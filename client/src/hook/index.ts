import type { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";

// custom dispatch and selector hooks preconfigured with our defined state and reducers
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
