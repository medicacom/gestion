import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Configuration from "../configuration";
var token = localStorage.getItem("x-access-token");

export const fetchDemande = createAsyncThunk("demande/fetchDemande", async (id) => {
  const response = await fetch(Configuration.BACK_BASEURL + "demande/allDemande/"+id, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const demande = await response.json();
  return demande;
});

export const getDemandeByRole = createAsyncThunk("demande/getDemandeByRole", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "demande/getDemandeByRole/"+action.idRole+"/"+action.idService, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const demande = await response.json();
  return demande;
});

export const demandeGetById = createAsyncThunk("demande/demandeGetById", async (id1) => {
  const  id  = id1;
  const response = await fetch(Configuration.BACK_BASEURL + "demande/getDemande", {
    method: 'POST',
    headers: {
      'id':id,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  
  });
  const demande = await response.json();
  return demande;
});

export const getDemandeValider = createAsyncThunk("demande/getDemandeValider", async (id) => {
  const response = await fetch(Configuration.BACK_BASEURL + "demande/getDemandeValider/"+id, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  
  });
  const demande = await response.json();
  return demande;
});
export const getFile = createAsyncThunk("demande/getFile", async (file) => {
  const response = await fetch(Configuration.BACK_BASEURL + "demande/getFile/"+file, {
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
const demandeReduce = createSlice({
  name: "demande",
  initialState: {
    entities: [],
    loading: false,
  },
  reducers: {
    demandeAdded(state, action) {
      fetch(Configuration.BACK_BASEURL + "demande/addDemande", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          "x-access-token": token,
          
        },
        body: JSON.stringify(action.payload)
      });
    },
    demandeFile(state, action) {
      fetch(Configuration.BACK_BASEURL + "demande/saveFile", {
        method: 'POST',
        headers: {
          'Accept': 'application/*',
          "x-access-token": token,
        },
        body:action.payload.fileArray
      });
    },
    demandeUpdated(state, action) {
      fetch(Configuration.BACK_BASEURL + "demande/addDemande", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          "x-access-token": token,
        },
        body: JSON.stringify(action.payload)
      });
    },
    demandeDeleted(state, action) {
      const { id } = action.payload;
      fetch(Configuration.BACK_BASEURL + "demande/deleteDemande/"+id, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          "x-access-token": token,
        },
      });
    },
    demandeChangeEtat(state, action) {
      const role = action.payload.idRole;
      const etat  = action.payload.etat;
      const id  = action.payload.id;
      const idUser  = action.payload.idUser;
      fetch(Configuration.BACK_BASEURL + "demande/changeEtat/"+id+"/"+role+"/"+etat+"/"+idUser, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          "x-access-token": token,
        },
        body: JSON.stringify(action.payload)
      });
    },

  },
  extraReducers: {

    [fetchDemande.pending]: (state, action) => {
      state.loading = true;
    },
    [fetchDemande.fulfilled]: (state, action) => {
      state.loading = false;
      state.entities = [...state.entities, ...action.payload];
    },
    [fetchDemande.rejected]: (state, action) => {
      state.loading = false;
    },
    [demandeGetById.pending]: (state, action) => {
      state.loading = true;
    },
    [demandeGetById.fulfilled]: (state, action) => {
      state.loading = false;
      state.entities = [...state.entities, action.payload];
    },
    [demandeGetById.rejected]: (state, action) => {
      state.loading = false;
    },
  },
});

export const { demandeAdded, demandeUpdated, demandeDeleted,demandeFile,demandeChangeEtat } = demandeReduce.actions;

export default demandeReduce.reducer;
