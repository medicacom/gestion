import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Configuration from "../configuration";
var token = localStorage.getItem("x-access-token");


export const fetchReference = createAsyncThunk("reference/getReference", async () => {
  const response = await fetch(Configuration.BACK_BASEURL + "reference/getReference", {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const reference = await response.json();
  return reference;
});
export const allReference = createAsyncThunk("reference/allReference", async () => {
  const response = await fetch(Configuration.BACK_BASEURL + "reference/allReference", {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const reference = await response.json();
  return reference;
});
export const getRefByService = createAsyncThunk("reference/getRefByService", async (id) => {
  const response = await fetch(Configuration.BACK_BASEURL + "reference/getRefByService/"+id, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const reference = await response.json();
  return reference;
});
export const referenceAdded = createAsyncThunk("reference/addReference", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "reference/addReference", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
    body: JSON.stringify(action)
  });
  const reference = await response.status;
  return reference;
});
export const addReferenceOld = createAsyncThunk("reference/addReferenceOld", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "reference/addReferenceOld", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
    body: JSON.stringify(action)
  });
  const reference = await response.json();
  return reference;
});
export const getByReference = createAsyncThunk("reference/getByReference", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "reference/getByReference", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
    body: JSON.stringify(action)
  });
  const reference = await response.json();
  return reference;
});
export const getFileEtapeDoc = createAsyncThunk("reference/getFileEtapeDoc", async (idDoc) => {
  const response = await fetch(Configuration.BACK_BASEURL + "reference/getFileEtapeDoc/"+idDoc, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const reference = await response.json();
  return reference;
});

export const getReferenceByDoc = createAsyncThunk("reference/getReferenceByDoc", async (idDoc) => {
  const response = await fetch(Configuration.BACK_BASEURL + "reference/getReferenceByDoc/"+idDoc, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const reference = await response.json();
  return reference;
});

const referenceReduce = createSlice({
  name: "reference",
  initialState: {
    entities: [],
    loading: false,
  },
  reducers: {
    referenceFile(state, action) {
      fetch(Configuration.BACK_BASEURL + "reference/saveFile", {
        method: 'POST',
        headers: {
          'Accept': 'application/*',
          'x-access-token':token
        },
        body:action.payload.fileArray
      });
    },
  },
  extraReducers: {

    [fetchReference.pending]: (state, action) => {
      state.loading = true;
    },
    [fetchReference.fulfilled]: (state, action) => {
      state.loading = false;
      state.entities = [...state.entities, ...action.payload];
    },
    [fetchReference.rejected]: (state, action) => {
      state.loading = false;
    },

  },
});

export const { referenceFile } = referenceReduce.actions;
export default referenceReduce.reducer;
