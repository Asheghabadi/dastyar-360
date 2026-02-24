import React, { useState, useEffect, useRef } from 'react';
import { Paper, Typography, CircularProgress, Alert, Box } from '@mui/material';
import { getGanttTasks } from '../../api';
import { useAppContext } from '../../context/AppContext';
import Gantt from 'frappe-gantt-react';

const GanttWidget = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAppContext();
    const ganttRef = useRef(null); // To hold the Gantt instance

    useEffect(() => {
        if (!token) return;

        const fetchTasks = async () => {
            try {
                setLoading(true);
                const data = await getGanttTasks(token);
                
                // Format data for the Gantt chart library
                const formattedTasks = data.map(task => ({
                    id: String(task.id),
                    name: task.name,
                    start: task.start_date, // format should be YYYY-MM-DD
                    end: task.end_date,     // format should be YYYY-MM-DD
                    progress: task.progress,
                    dependencies: task.dependencies || ''
                }));

                setTasks(formattedTasks);
            } catch (err) {
                setError('Failed to fetch Gantt chart tasks.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [token]);

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>نمودار گانت وظایف حقوقی و اجرایی</Typography>
            <Box sx={{ mt: 2, position: 'relative', minHeight: '300px' }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                    </Box>
                )}
                {error && <Alert severity="error">{error}</Alert>}
                {!loading && !error && (
                    tasks.length > 0 ? (
                        <Gantt 
                            tasks={tasks} 
                            viewMode={'Month'} // Other modes: Quarter Day, Half Day, Day, Week, Month
                            onClick={(task) => console.log(task)}
                            onDateChange={(task, start, end) => console.log(task, start, end)}
                            onProgressChange={(task, progress) => console.log(task, progress)}
                            onTasksChange={(tasks) => console.log(tasks)}
                            customPopupHtml={(task) => {
                                return `
                                <div class="details-container">
                                    <h5>${task.name}</h5>
                                    <p>شروع: ${task.start}</p>
                                    <p>پایان: ${task.end}</p>
                                    <p>پیشرفت: ${task.progress}%</p>
                                </div>
                                `;
                            }}
                            ref={ganttRef}
                        />
                    ) : (
                        <Typography>هیچ وظیفه‌ای برای نمایش در نمودار گانت یافت نشد.</Typography>
                    )
                )}
            </Box>
        </Paper>
    );
};

export default GanttWidget;
