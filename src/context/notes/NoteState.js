import NoteContext from "./noteContext";
import { useState } from "react";
const NoteState=(props)=>{
    const host="localhost:5000"
    
    const notesInitial=[]
    const[notes,setNotes]=useState(notesInitial);
     // Get all notes
     const getNotes=async()=>{
        // TODO: API call
        const response = await fetch(`${host}/api/notes/fetchallnotes`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Auth-Token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjVlYmY4NmZmNDc0NDVjNTZkYTA1YzIyIn0sImlhdCI6MTcwOTk2NzI1OH0.v00TyfF0m9LKacjX27Ag5a-BSwp8ZbIFqW9gCpebKEA"
            },
          });
         const json=await response.json();
         setNotes(json)
         console.log(json)
    }

    // Add a new note
    const addNote=async(title,description,tag)=>{
        // TODO: API call
        const response = await fetch(`${host}/api/notes/addnote`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "auth-token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjVlYmY4NmZmNDc0NDVjNTZkYTA1YzIyIn0sImlhdCI6MTcwOTk2NzI1OH0.v00TyfF0m9LKacjX27Ag5a-BSwp8ZbIFqW9gCpebKEA"
            },
            body: JSON.stringify({title,description,tag}), 
          });
         
        console.log("Adding a new note")
     const  note={
            "_id": "65f29bb21d031dfe5b9e0bb2",
            "user": "65eac8e8e78a9f0b740db981",
            "title": title,
            "description": description,
            "tag": tag,
            "date": "2024-03-14T06:39:46.046Z",
            "__v": 0
          };
        setNotes(notes.concat(note))
        console.log(title)
    }

// Delete note
const deleteNote=(id)=>{
    // TODO: API call
console.log("deleting note with id"+id);
const newNotes=notes.filter((note)=>{return(note._id!==id)});
setNotes(newNotes)
}

// Edit Note

const editNote=async(id,title,description,tag)=>{
    // API Call
    const response = await fetch(`${host}/api/notes/updatenote/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Auth-Token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjVlYmY4NmZmNDc0NDVjNTZkYTA1YzIyIn0sImlhdCI6MTcwOTk2NzI1OH0.v00TyfF0m9LKacjX27Ag5a-BSwp8ZbIFqW9gCpebKEA"
        },
        body: JSON.stringify({title,description,tag}), 
      });
      const json=response.json();
        
for(let i=0;i<notes.length;i++){
if(notes[i]._id==id){
    notes[i].title=title;
    notes[i].description=description;
    notes[i].tag=tag;
}
}
}





    return (
        <NoteContext.Provider value={{notes,addNote,deleteNote,editNote,getNotes}}>
            {props.children}
        </NoteContext.Provider>
    )
}
export default NoteState