import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Configuration from "../configuration";
var token = localStorage.getItem("x-access-token");

export const fetchService = createAsyncThunk("service/fetchService", async () => {
  const response = await fetch(Configuration.BACK_BASEURL + "service/allService", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const service = await response.json();
  return service;
});

export const serviceGetById = createAsyncThunk("service/serviceGetById", async (id1) => {
  const  id  = id1;
  const response = await fetch(Configuration.BACK_BASEURL + "service/getService", {
    method: 'POST',
    headers: {
      'id':id,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  
  });
  const service = await response.json();
  return service;
});
const serviceReduce = createSlice({
  name: "service",
  initialState: {
    entities: [],
    loading: false,
  },
  reducers: {
    serviceAdded(state, action) {
      fetch(Configuration.BACK_BASEURL + "service/addService", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token':token
        },
        body: JSON.stringify(action.payload)
      });
    },
    serviceUpdated(state, action) {
      fetch(Configuration.BACK_BASEURL + "service/addService", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token':token
        },
        body: JSON.stringify(action.payload)
      });
    },
    serviceDeleted(state, action) {
      const { id } = action.payload;
      fetch(Configuration.BACK_BASEURL + "service/deleteService/"+id, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token':token
        },
      });
    },

  },
  extraReducers: {

    [fetchService.pending]: (state, action) => {
      state.loading = true;
    },
    [fetchService.fulfilled]: (state, action) => {
      state.loading = false;
      state.entities = [...state.entities, ...action.payload];
    },
    [fetchService.rejected]: (state, action) => {
      state.loading = false;
    },
    [serviceGetById.pending]: (state, action) => {
      state.loading = true;
    },
    [serviceGetById.fulfilled]: (state, action) => {
      state.loading = false;
      state.entities = [...state.entities, action.payload];
    },
    [serviceGetById.rejected]: (state, action) => {
      state.loading = false;
    },
  },
});

export const { serviceAdded, serviceUpdated, serviceDeleted } = serviceReduce.actions;

export default serviceReduce.reducer;
