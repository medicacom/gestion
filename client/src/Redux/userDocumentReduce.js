import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Configuration from "../configuration";
var token = localStorage.getItem("x-access-token");

export const getUserDocByType = createAsyncThunk("userDocument/getUserDoc", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "userDocument/getUserDocByType/"+action.id+"/"+action.userType, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const userDocument = await response.json();
  return userDocument;
});
export const detailsRedaction = createAsyncThunk("userDocument/detailsRedaction", async (id) => {
  const response = await fetch(Configuration.BACK_BASEURL + "userDocument/detailsRedaction/"+id, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const userDocument = await response.json();
  return userDocument;
});
export const saveEtape = createAsyncThunk("userDocument/saveEtape", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "userDocument/saveEtape", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
    body:JSON.stringify(action)
  });
  const userDocument = await response.json();
  return userDocument;
});
export const getEtape = createAsyncThunk("userDocument/getEtape", async (action) => {
  var idUser = action.idUser;
  var idDoc = action.idDoc;
  const response = await fetch(Configuration.BACK_BASEURL + "userDocument/getEtape/"+idDoc+"/"+idUser, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const userDocument = await response.json();
  return userDocument;
});
export const getFileEtape = createAsyncThunk("userDocument/getFileEtape", async (action) => {
  var idUser = action.idUser;
  var idDoc = action.idDoc;
  const response = await fetch(Configuration.BACK_BASEURL + "userDocument/getFileEtape/"+idDoc+"/"+idUser, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const userDocument = await response.json();
  return userDocument;
});
export const getDocVerification = createAsyncThunk("userDocument/getDocVerification", async (action) => {
  //var id = action.id;
  var etat = action.etat;
  var type = action.type;
  const response = await fetch(Configuration.BACK_BASEURL + "userDocument/getDocVerification/"+etat+"/"+type, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const userDocument = await response.json();
  return userDocument;
});
export const getUserDocByIdDoc = createAsyncThunk("userDocument/getUserDocByIdDoc", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "userDocument/getUserDocByIdDoc/"+action.idDoc+"/"+action.idUser, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const userDocument = await response.json();
  return userDocument;
});
export const getDocVigeur = createAsyncThunk("userDocument/getDocVigeur", async (action) => {
  var id = action.idDoc;
  const response = await fetch(Configuration.BACK_BASEURL + "userDocument/getDocVigeur/"+id, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const userDocument = await response.json();
  return userDocument;
});
export const getQuestion = createAsyncThunk("userDocument/getQuestion", async (id) => {
  const response = await fetch(Configuration.BACK_BASEURL + "userDocument/getQuestion/"+id, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const userDocument = await response.json();
  return userDocument;
});
export const getReponse = createAsyncThunk("userDocument/getReponse", async (id) => {
  const response = await fetch(Configuration.BACK_BASEURL + "userDocument/getReponse/"+id, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const userDocument = await response.json();
  return userDocument;
});
/* export const getReponseQuestion = createAsyncThunk("userDocument/getReponseQuestion", async (id) => {
  const response = await fetch(Configuration.BACK_BASEURL + "userDocument/getReponseQuestion/"+id, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const userDocument = await response.json();
  return userDocument;
});
export const getReponseExamen = createAsyncThunk("userDocument/getReponseExamen", async (id) => {
  const response = await fetch(Configuration.BACK_BASEURL + "userDocument/getReponseExamen/"+id, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },

  });
  const userDocument = await response.json();
  return userDocument;
}); */
export const verifReponse = createAsyncThunk("userDocument/verifReponse", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "userDocument/verifReponse", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
    body:JSON.stringify(action)

  });
  const userDocument = await response.json();
  return userDocument;
});
export const getScore = createAsyncThunk("userDocument/getScore", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "userDocument/getScore/"+action.idUser+"/"+action.id, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-access-token':token
    },
  });
  const userDocument = await response.json();
  return userDocument;
});

const userDocumentReduce = createSlice({
  name: "userDocument",
  initialState: {
    entities: [],
    loading: false,
  },
  reducers: {
    saveQuestion(state, action) {
      fetch(Configuration.BACK_BASEURL + "userDocument/saveQuestion", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token':token
        },
        body: JSON.stringify(action.payload)
      });
    },
    saveVigueurDoc(state, action) {
      fetch(Configuration.BACK_BASEURL + "userDocument/saveVigueurDoc", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token':token
        },
        body: JSON.stringify(action.payload)
      });
    },
    saveFiles(state, action) {
      fetch(Configuration.BACK_BASEURL + "userDocument/saveFile", {
        method: 'POST',
        headers: {
          'Accept': 'application/*',
          'x-access-token':token
        },
        body:action.payload
      });
    },
    deleteEtapeDoc(state, action) {
      const { id } = action.payload;
      fetch(Configuration.BACK_BASEURL + "userDocument/deleteEtapeDoc/"+id, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token':token
        },
      });
    },
    docChangeEtat(state, action) {
      const id  = action.payload.id; 
      const iduser  = action.payload.iduser;
      const etat  = action.payload.etat;
      fetch(Configuration.BACK_BASEURL + "userDocument/changeEtat/"+id+"/"+etat+"/"+iduser, {
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

    [getUserDocByType.pending]: (state, action) => {
      state.loading = true;
    },
    [getUserDocByType.fulfilled]: (state, action) => {
      state.loading = false;
      state.entities = [...state.entities, ...action.payload];
    },
    [getUserDocByType.rejected]: (state, action) => {
      state.loading = false;
    },
  },
});

export const { saveFiles,deleteEtapeDoc,docChangeEtat,saveVigueurDoc,saveQuestion } = userDocumentReduce.actions;
export default userDocumentReduce.reducer;
