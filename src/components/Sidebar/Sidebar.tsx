import './Sidebar.scss'
import logo from '../../assets/rythmhacks-circle.png'
import { Link, useLocation } from 'react-router-dom'
import { BiHome } from 'react-icons/bi'
import { BsClipboard2Check } from 'react-icons/bs'
import { useAuth } from '../../contexts/Auth'

const Sidebar = () => {
    
    const { user } = useAuth();
    let location = useLocation().pathname

    if (location === '/login') {
        return null;
    }

    return (
        <div className="sidebar">
            <div>
                <div className='flex gap-4 items-center px-4 pt-8'>
                    <img src={logo} alt='sidebarlogo' className='rounded-md h-[3rem]'></img>
                    <h3>Hacker<br/>Dashboard</h3>
                </div>
                <div className='mt-[4rem]'>
                    <Link to='/dashboard' className={(location === '/dashboard') ? "active" : ""}><BiHome/> Home</Link>
                    <Link to='/dashboard/apply' className={(location === '/dashboard/apply') ? "active" : ""}><BsClipboard2Check/> Apply</Link>
                </div>
            </div>

            <div className='flex items-center bg-dark1 p-4'>
                {/* {(user?.name) ? user?.email : user?.name} */}
                {user?.email}
            </div>
        </div>
    )
}

export default Sidebar