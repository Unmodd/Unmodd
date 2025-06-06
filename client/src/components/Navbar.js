import { Component } from "react";
import { MenuData } from "./MenuData";
import "./NavbarStyles.css";



class Navbar extends Component { 
    state ={clicked: false};
    handleClick =()=>{
        this.setState({clicked:
        !this.state.clicked})
    }
    render(){
        return(
            <nav className="NavbarItems">
                <img src={require('../assets/logo.png')} width={200} height={50} alt = 'Unmodd' />
                <div className="menu-icons" onClick={this.handleClick}>
                    <i className={this.state.clicked ? "fas fa-times" : "fas fa-bars"}></i>
                </div>
                <ul className={this.state.clicked ? "nav-menu active" : "nav-menu"}>
                    {MenuData.map((item, index) => {
                        return (
                            <li key={index}>
                                <a href={item.url}
                                className={item.cName}>
                                {item.title}
                                </a>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        );
    }
}

export default Navbar

