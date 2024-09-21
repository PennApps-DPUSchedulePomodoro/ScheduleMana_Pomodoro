import makeRequest from "../utils/request";
import PomodoroTimer from "./Pomodoro/PomTimer";
import TaskQueueComponent from "./Tasks/TaskComponent";
import Header from "./Header/Header";


const MainWrapper = () =>{

    const tokenRetrieve = async () => await makeRequest(
        {
            method: 'GET',
            url: "/auth/token"
        }
    )
    sessionStorage.setItem('accessToken', tokenRetrieve.access_token)

    return (
        <div className="container">
            <Header/>
            <TaskQueueComponent/>
            <section className="bottom-row">
                <PomodoroTimer/>
            </section>
            {/*<Form/>*/}
        </div>
    )
}

export default MainWrapper;