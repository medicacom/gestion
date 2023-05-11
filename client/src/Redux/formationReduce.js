import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Configuration from "../configuration";
var token = localStorage.getItem("x-access-token");

export const allFormation = createAsyncThunk("formation/allFormation", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "formation/allFormation", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
    body: JSON.stringify(action)
  });
  const formation = await response.json();
  return formation;
});

export const getFormateur = createAsyncThunk("formation/getFormateur", async (id) => {
  const response = await fetch(Configuration.BACK_BASEURL + "formation/getFormateur/"+id, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  });
  const formation = await response.json();
  return formation;
});
export const formationAdded = createAsyncThunk("formation/addFormation", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "formation/addFormation", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
    body: JSON.stringify(action)
  });
  const formation = await response.json();
  return formation;
});
export const addFormationOld = createAsyncThunk("formation/addFormationOld", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "formation/addFormationOld", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
    body: JSON.stringify(action)
  });
  const formation = await response.json();
  return formation;
});

export const getFile = createAsyncThunk("formation/getFile", async (file) => {
  const response = await fetch(Configuration.BACK_BASEURL + "formation/getFile/"+file, {
    method: "GET",
    responseType: "blob",
    //Force to receive data in a Blob Format
  })
  .then((response) => {
    return response.url;
  })
  .catch((error) => {
    console.log(error);
  })
  const files = await response;
  return files;
});
const formationReduce = createSlice({
  name: "formation",
  initialState: {
    entities: [],
    loading: false,
  },
  reducers: {
    addInvite(state, action) {
      fetch(Configuration.BACK_BASEURL + "formation/addInvite", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token':token
        },
        body: JSON.stringify(action.payload)
      });
    },
    saveFiche(state, action) {
      fetch(Configuration.BACK_BASEURL + "formation/saveFiche", {
        method: 'POST',
        headers: {
          'Accept': 'application/*',
          'x-access-token':token
        },
        body:action.payload.fileArray
      });
    },
    formationChangeEtat(state, action) {
      const { id } = action.payload;
      fetch(Configuration.BACK_BASEURL + "formation/changeEtat/"+id, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token':token
        },
        body: JSON.stringify(action.payload)
      });
    },

  },
  extraReducers: {

    [allFormation.pending]: (state, action) => {
      state.loading = true;
    },
    [allFormation.fulfilled]: (state, action) => {
      state.loading = false;
      state.entities = [...state.entities, ...action.payload];
    },
    [allFormation.rejected]: (state, action) => {
      state.loading = false;
    },
  },
});

export const { addInvite,formationChangeEtat,saveFiche } = formationReduce.actions;

export default formationReduce.reducer;
