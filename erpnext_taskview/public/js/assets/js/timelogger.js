import useBackendHandler from './script.js';

export default function useTimeLogger(props, emit, description, startTime, stopTime, docText) {
    const { callBackendHandler } = useBackendHandler();

    const formatDateTime = (date) => {
        const pad = (num) => String(num).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    const logTime = async () => {
        if (!startTime.value || !stopTime.value) {
            alert('Both start time and stop time are required!');
            return;
        }

        console.log(`Logged time for ${docText.value}: Start Time - ${startTime.value}, Stop Time - ${stopTime.value}, Description - ${description.value}`);
        console.log(props.doc);
        // API call can be placed here
        try {
            const r = await callBackendHandler('log_time', {
                project: props.doc.project,
                docName: props.doc.taskName,
                startTime: startTime.value,
                stopTime: stopTime.value,
                description: description.value || ''
            }, null);

            // r.message should be the timesheet detail object, which we want to send to the sidebar
            // emit('open-sidebar', r.message);

            frappe.show_alert({
                message: __(`Time logged for ${docText.value}`),
                indicator: 'green'
            });
            
        }
        catch (error) {
            emit('catch-error', error)
        }


        closeSidebar(); // Close sidebar after logging time
    };

    const closeSidebar = () => {
        emit('close-time-logger');
    };

    return {
        formatDateTime,
        logTime,
        closeSidebar
    }
}
