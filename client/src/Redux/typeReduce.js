import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Configuration from "../configuration";
var token = localStorage.getItem("x-access-token");

export const fetchType = createAsyncThunk("typeDocument/fetchType", async () => {
  const response = await fetch(Configuration.BACK_BASEURL + "typeDocument/allType", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const typeDocument = await response.json();
  return typeDocument;
});

export const typeDocumentGetById = createAsyncThunk("typeDocument/typeDocumentGetById", async (id1) => {
  const  id  = id1;
  const response = await fetch(Configuration.BACK_BASEURL + "typeDocument/getType", {
    method: 'POST',
    headers: {
      'id':id,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  
  });
  const typeDocument = await response.json();
  return typeDocument;
});
export const getFile = createAsyncThunk("typeDocument/getFile", async (file) => {
  const response = await fetch(Configuration.BACK_BASEURL + "typeDocument/getFile/"+file, {
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
const typeDocumentReduce = createSlice({
  name: "typeDocument",
  initialState: {
    entities: [],
    loading: false,
  },
  reducers: {
    typeDocumentAdded(state, action) {
      fetch(Configuration.BACK_BASEURL + "typeDocument/addType", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token':token
        },
        body: JSON.stringify(action.payload)
      });
    },
    typeDocFile(state, action) {
      fetch(Configuration.BACK_BASEURL + "typeDocument/saveFile", {
        method: 'POST',
        headers: {
          'Accept': 'application/*',
          'x-access-token':token
        },
        body:action.payload.fileArray
      });
    },
    typeDocumentUpdated(state, action) {
      fetch(Configuration.BACK_BASEURL + "typeDocument/addType", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token':token
        },
        body: JSON.stringify(action.payload)
      });
    },
    typeDocumentDeleted(state, action) {
      const { id } = action.payload;
      fetch(Configuration.BACK_BASEURL + "typeDocument/deleteType/"+id, {
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

    [fetchType.pending]: (state, action) => {
      state.loading = true;
    },
    [fetchType.fulfilled]: (state, action) => {
      state.loading = false;
      state.entities = [...state.entities, ...action.payload];
    },
    [fetchType.rejected]: (state, action) => {
      state.loading = false;
    },
    [typeDocumentGetById.pending]: (state, action) => {
      state.loading = true;
    },
    [typeDocumentGetById.fulfilled]: (state, action) => {
      state.loading = false;
      state.entities = [...state.entities, action.payload];
    },
    [typeDocumentGetById.rejected]: (state, action) => {
      state.loading = false;
    },
  },
});

export const { typeDocumentAdded, typeDocumentUpdated, typeDocumentDeleted,typeDocFile } = typeDocumentReduce.actions;

export default typeDocumentReduce.reducer;
