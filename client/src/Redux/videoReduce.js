import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Configuration from "../configuration";
var token = localStorage.getItem("x-access-token");

export const getVideo = createAsyncThunk("video/getVideo", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "video/getVideo/"+action.idUser+"/"+action.idDoc, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token,
    },

  });
  const video = await response.json();
  return video;
});

export const getVideoDocument = createAsyncThunk("video/getVideoDocument", async (id) => {
  const response = await fetch(Configuration.BACK_BASEURL + "video/getVideoDocument", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token,
      'id':id
    },

  });
  const video = await response.json();
  return video;
});

export const fetchVideo = createAsyncThunk("video/fetchVideo", async (file) => {
  const response = await fetch(Configuration.BACK_BASEURL + "video/fetchVideo/"+file, {
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
    const video = await response;
    return video;
});

const videoReduce = createSlice({
  name: "video",
  initialState: {
    entities: [],
    loading: false,
  },
  reducers: {
    saveVideoDoc(state, action) {
      fetch(Configuration.BACK_BASEURL + "video/saveVideoDoc", {
        method: 'POST',
        headers: {
          'Accept': 'application/*',
          'x-access-token':token
        },
        body:action.payload
      });
    },  
    saveVideoUser(state, action) {
 
      fetch(Configuration.BACK_BASEURL + "video/saveVideoUser", {
        method: 'POST',
        headers: {      
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token':token
        },
        body:JSON.stringify(action.payload)
      });
    },
    },
  extraReducers: {
    [getVideoDocument.pending]: (state, action) => {
      state.loading = true;
    },
    [getVideoDocument.fulfilled]: (state, action) => {
      state.loading = false;
      state.entities = [...state.entities, action.payload];
    },
    [getVideoDocument.rejected]: (state, action) => {
      state.loading = false;
    },
  },
});
export const { saveVideoDoc,saveVideoUser } = videoReduce.actions;
export default videoReduce.reducer;
