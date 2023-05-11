import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./Redux/usersReduce";
import roleReducer from "./Redux/roleReduce";
import serviceReducer from "./Redux/serviceReduce";
import settingsReducer from "./Redux/settingsReduce";
import typeReducer from "./Redux/typeReduce";
import demandeReducer from "./Redux/demandeReduce";
import documentReducer from "./Redux/documentReduce";
import notificationReducer from "./Redux/notificationReduce";
import userDocReducer from "./Redux/userDocumentReduce";
import vigueurReducer from "./Redux/vigueurReduce";
import referenceReducer from "./Redux/referenceReduce";
import feuilleReducer from "./Redux/feuilleReduce";
import formationReducer from "./Redux/formationReduce";
import messagerieReducer from "./Redux/messagerieReduce";
import videoReducer from "./Redux/videoReduce";
import rootBaseReduce from "./Redux/rootBaseReduce";
export default configureStore({
  reducer: {
    users: usersReducer,
    role: roleReducer,
    service: serviceReducer,
    settings: settingsReducer,
    typeDocument: typeReducer,
    demande: demandeReducer,
    document: documentReducer, 
    notification: notificationReducer,
    userDoc: userDocReducer,
    vigueur: vigueurReducer,
    reference: referenceReducer,
    feuille: feuilleReducer,
    formation: formationReducer,
    messagerie: messagerieReducer,
    video: videoReducer,
    rootBase: rootBaseReduce,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false,}),
});
