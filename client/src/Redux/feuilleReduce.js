import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Configuration from "../configuration";
var token = localStorage.getItem("x-access-token");

export const feuilleGetById = createAsyncThunk("feuille/FeuilleGetById", async (id1) => {
  const  id  = id1;
  const response = await fetch(Configuration.BACK_BASEURL + "feuille/getFeuille", {
    method: 'POST',
    headers: {
      'id':id,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  
  });
  const feuille = await response.json();
  return feuille;
});
export const generatePdfFeuille = createAsyncThunk("pdfFeuille/generatePdfFeuille", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "pdfFeuille/generatePdfFeuille/", {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token,
    },
    body: JSON.stringify(action)
    //Force to receive data in a Blob Format
  })
  const feuille = await response.json();
  return feuille;
});
export const getFileFeuille = createAsyncThunk("pdfFeuille/getFile", async (file) => {
  const response = await fetch(Configuration.BACK_BASEURL + "pdfFeuille/getFile/"+file, {
    method: "GET",
    responseType: "blob",    
    type: "application/pdf",
    headers: {
      'Content-Disposition':'attachment;filename:feuille.pdf'
    },
    //Force to receive data in a Blob Format
  }).then(response => response.blob())
  .then(function(myBlob) {
    return((myBlob))
  })
  .catch((error) => {
    console.log(error);
  })
  const files = await response;
  return files;
});
const feuilleReduce = createSlice({
  name: "feuille",
  initialState: {
    entities: [],
    loading: false,
  },
  reducers: {
    feuilleAdded(state, action) {
      fetch(Configuration.BACK_BASEURL + "feuille/addFeuille", {
        method: 'POST',
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
    [feuilleGetById.pending]: (state, action) => {
      state.loading = true;
    },
    [feuilleGetById.fulfilled]: (state, action) => {
      state.loading = false;
      state.entities = [...state.entities, action.payload];
    },
    [feuilleGetById.rejected]: (state, action) => {
      state.loading = false;
    },
  },
});

export const { feuilleAdded } = feuilleReduce.actions;

export default feuilleReduce.reducer;
