import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Configuration from "../configuration";
var token = localStorage.getItem("x-access-token");

export const getMessage = createAsyncThunk("messagerie/getMessage", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "messagerie/getMessage/"+action.idDoc, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const msg = await response.json();
  return msg;
});

export const getMessageByIdUser = createAsyncThunk("messagerie/getMessageByIdUser", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "messagerie/getMessageByIdUser", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
    body:JSON.stringify(action)

  });
  const msg = await response.json();
  return msg;
});
export const addMessage = createAsyncThunk("messagerie/addUser", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "messagerie/addMessage", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
    body: JSON.stringify(action)
  });
  const msg = await response.status;
  return msg;
});


const messagerieReduce = createSlice({
  name: "messagerie",
  initialState: {
    entities: [],
    loading: false,
  },
  reducers: {
    /* addMessage(state, action) {
      fetch(Configuration.BACK_BASEURL + "messagerie/addMessage", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(action.payload)
      });
    }, */
    updateMessage(state, action) {
      const  id  = action.payload;
      fetch(Configuration.BACK_BASEURL + "messagerie/update/"+id, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token':token
        },
      });
    },
  },
  extraReducers: {

    [getMessageByIdUser.pending]: (state, action) => {
      state.loading = true;
    },
    [getMessageByIdUser.fulfilled]: (state, action) => {
      state.loading = false;
      state.entities = [...state.entities, ...action.payload];
    },
    [getMessageByIdUser.rejected]: (state, action) => {
      state.loading = false;
    },
    
  },
});

export const { updateMessage } = messagerieReduce.actions;

export default messagerieReduce.reducer;
