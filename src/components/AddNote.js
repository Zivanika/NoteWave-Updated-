import React,{useContext,useState} from 'react'
import noteContext from "../context/notes/noteContext"
const AddNote = () => {
    const context=useContext(noteContext);
    const{addNote}=context;
    const[note,setNote]=useState({title:"",description:"",tag:"default"})
    const handleClick=(e)=>{
      e.preventDefault();
        addNote(note.title,note.description,note.tag)
    }
    const onChange=(e)=>{
          setNote({...note,[e.target.name]:e.target.value})   
    }
  return (
    <div>
       <div className="container my-3">
    <h1>Add a note</h1>
    <form className='my-3'>
  <div className="mb-3">
    <label for="title" className="form-label">Title</label>
    <input type="text" className="form-control" id="title" name="title" onChange={onChange}/>
    {/* <div id="emailHelp" className="form-text">W.</div> */}
  </div>
  <div className="mb-3">
    <label for="description" className="form-label">Description</label>
    <input type="text" className="form-control" name="description" id="description" onChange={onChange}/>
  </div>
  {/* <div className="mb-3 form-check">
    <input type="checkbox" className="form-check-input" id="exampleCheck1" onChange={onChange}/>
    <label className="form-check-label" for="exampleCheck1">Check me out</label>
  </div> */}
  <button type="submit" className="btn btn-primary" onClick={handleClick}>Add Note</button>
</form>
    </div>
    </div>
  )
}

export default AddNote
