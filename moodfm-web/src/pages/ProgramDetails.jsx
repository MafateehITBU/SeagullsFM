import React, { useEffect, useState, useRef } from 'react'
import axiosInstance from '../axiosConfig'
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import NoData from '../components/UI/NoData'
import { formatTextWithSpecialChars } from '../utils/formatTextWithSpecialChars'

// Function to format days
const formatDays = (days) => {
    if (!days || !Array.isArray(days) || days.length === 0) {
        return "-";
    }

    // Day order mapping
    const dayOrder = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
    };

    // Sort days by their order
    const sortedDays = [...days].sort((a, b) => dayOrder[a] - dayOrder[b]);

    // Check if days are consecutive (including wrap-around)
    const isConsecutive = sortedDays.every((day, index) => {
        if (index === 0) return true;
        const prevDayIndex = dayOrder[sortedDays[index - 1]];
        const currentDayIndex = dayOrder[day];
        // Check if consecutive (including wrap-around: Saturday to Sunday)
        const isNextDay = currentDayIndex === prevDayIndex + 1;
        const isWrapAround = prevDayIndex === 6 && currentDayIndex === 0;
        return isNextDay || isWrapAround;
    });

    if (isConsecutive && sortedDays.length > 1) {
        // Format as range: "Sunday - Tuesday"
        return `${sortedDays[0]} - ${sortedDays[sortedDays.length - 1]}`;
    } else {
        // Format as comma-separated: "Sunday, Monday, Friday"
        return sortedDays.join(", ");
    }
};

const ProgramDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const programId = location.state?.programId;
    const [program, setProgram] = useState(null)
    const [interviews, setInterviews] = useState([])
    const [filteredInterviews, setFilteredInterviews] = useState([])
    const [loadingProgram, setLoadingProgram] = useState(true)
    const [loadingInterviews, setLoadingInterviews] = useState(true)
    const [selectedDate, setSelectedDate] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [interviewsPerPage, setInterviewsPerPage] = useState(3)
    const calendarRef = useRef(null)
    const dateInputRef = useRef(null)

    useEffect(() => {
        fetchProgram();
        fetchInterviews();
    }, [])

    const fetchProgram = async () => {
        try {
            const response = await axiosInstance.get(`/program/${programId}`)
            setProgram(response.data.data)
            setLoadingProgram(false)
        } catch (error) {
            console.error('Error fetching program:', error)
        } finally {
            setLoadingProgram(false)
        }
    }

    const fetchInterviews = async () => {
        try {
            const response = await axiosInstance.get(`/interview`)
            const filtered = response.data.data.filter(interview => interview.programId._id === programId)
            setInterviews(filtered)
            setFilteredInterviews(filtered)
            setLoadingInterviews(false)
        } catch (error) {
            console.error('Error fetching interviews:', error)
        } finally {
            setLoadingInterviews(false)
        }
    }

    // Handle responsive interviews per page
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setInterviewsPerPage(1) // Mobile: 1 interview
            } else {
                setInterviewsPerPage(3) // Desktop: 3 interviews
            }
            // Reset to page 1 when screen size changes
            setCurrentPage(1)
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Filter interviews by date and search query
    useEffect(() => {
        let filtered = [...interviews]

        // Filter by date
        if (selectedDate) {
            const selectedDateStr = new Date(selectedDate).toISOString().split('T')[0]
            filtered = filtered.filter(interview => {
                const interviewDate = new Date(interview.createdAt).toISOString().split('T')[0]
                return interviewDate === selectedDateStr
            })
        }

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter(interview =>
                interview.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                interview.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredInterviews(filtered)
        // Reset to page 1 when filters change
        setCurrentPage(1)
    }, [selectedDate, searchQuery, interviews])

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setIsCalendarOpen(false)
            }
        }

        if (isCalendarOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isCalendarOpen])

    const handleCalendarClick = (e) => {
        e.stopPropagation()
        setIsCalendarOpen(!isCalendarOpen)
    }

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value)
        setIsCalendarOpen(false)
    }

    const clearDateFilter = (e) => {
        e.stopPropagation()
        setSelectedDate(null)
        setIsCalendarOpen(false)
        if (dateInputRef.current) {
            dateInputRef.current.value = ''
        }
    }

    const formatDate = (dateString) => {
        // Show only the month and year
        const date = new Date(dateString)
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const month = monthNames[date.getMonth()]
        const year = date.getFullYear()
        return `${month}, ${year}`
    }

    const formatTime = (timeString) => {
        if (!timeString) return ''
        // timeString format: "15:00" or "15:00:00"
        const [hours, minutes] = timeString.split(':')
        const hour24 = parseInt(hours, 10)
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
        const ampm = hour24 >= 12 ? 'PM' : 'AM'
        return `${hour12}:${minutes} ${ampm}`
    }
    return (
        <>
            <Header />

            {/* Program Details Section */}
            <section className="program-details-section d-flex align-items-start justify-content-center gap-5">
                {loadingProgram ? (
                    <div className="d-flex align-items-center justify-content-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : !program ? (
                    <NoData message="Program not found" icon="material-symbols:radio-outline" />
                ) : (
                    <>
                        {/* Image on the left */}
                        < div className="program-details-image">
                            <img src={program?.programDetailsImage?.url || program?.image?.url} alt={program?.title} />
                        </div>

                        {/* Content on the right */}
                        <div className="program-details-content d-flex flex-column gap-5">
                            <div className="top-content">
                                <h3 className='mb-3'>{program?.title}</h3>
                                <p>{program?.description}</p>
                            </div>
                            <div className="bottom-content">
                                <p className='d-flex align-items-center gap-2'><Icon icon="material-symbols:calendar-today-outline-rounded" />Days: {formatDays(program?.days)}</p>
                                <p className='d-flex align-items-center gap-2'><Icon icon="material-symbols:nest-clock-farsight-analog-outline-rounded" />Time: {formatTime(program?.startTime)} - {formatTime(program?.endTime)}</p>
                                <p className='d-flex align-items-center gap-2'><Icon icon="material-symbols:headset-mic-outline-rounded" /> Mood: Retro • Nostalgic • Feel Good</p>
                            </div>


                        </div>
                    </>)}
            </section >

            {/* Interview Section */}
            < section className="interview-section my-5" >
                <div className="interview-header text-center">
                    <h2>Interviews</h2>
                    <p>Exclusive conversations with artists, creators, and voices <br /> from across the music scene.</p>
                </div>

                <div className="interview-filters-container">
                    <div className="interview-filters d-flex align-items-center gap-3">
                        {/* Calendar Filter */}
                        <div className="calendar-filter-wrapper" ref={calendarRef}>
                            <button
                                className="calendar-filter-btn"
                                onClick={handleCalendarClick}
                            >
                                <Icon icon="material-symbols:calendar-today-outline-rounded" />
                                <span>Calendar</span>
                            </button>
                            {selectedDate && (
                                <button
                                    className="clear-date-filter"
                                    onClick={clearDateFilter}
                                    title="Clear date filter"
                                >
                                    <Icon icon="material-symbols:close" />
                                </button>
                            )}
                            {isCalendarOpen && (
                                <div className="calendar-dropdown">
                                    <input
                                        ref={dateInputRef}
                                        type="date"
                                        className="calendar-date-input-visible"
                                        onChange={handleDateChange}
                                        value={selectedDate || ''}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Search Bar */}
                        <div className="interview-search-bar">
                            <Icon icon="material-symbols:search" className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search Interviews"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="interviews-container">
                    {loadingInterviews ? (
                        <div className="d-flex align-items-center justify-content-center">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : filteredInterviews.length === 0 ? (
                        <NoData
                            message={searchQuery || selectedDate ? "No interviews found matching your search criteria" : "No interviews available for this program"}
                            icon="material-symbols:video-library-outline"
                        />
                    ) : (
                        <>
                            <div className="interviews-list">
                                {(() => {
                                    const totalPages = Math.ceil(filteredInterviews.length / interviewsPerPage)
                                    const startIndex = (currentPage - 1) * interviewsPerPage
                                    const endIndex = startIndex + interviewsPerPage
                                    const currentInterviews = filteredInterviews.slice(startIndex, endIndex)

                                    return currentInterviews.map(interview => (
                                        <div key={interview._id} className="interview-card">
                                            <div className="interview-card-video-wrapper">
                                                <video
                                                    src={interview?.content?.url}
                                                    className="interview-card-video"
                                                    controls
                                                />
                                            </div>
                                            <div className="interview-card-content d-flex flex-column gap-3">
                                                {/* Show the special characters in the title */}
                                                <h4 className="interview-card-title">{formatTextWithSpecialChars(interview.title)}</h4>
                                                {interview.description && (
                                                    <p>{interview.description}</p>
                                                )}
                                                <p className='d-flex align-items-center gap-2'>
                                                    <Icon icon="material-symbols:calendar-today-outline-rounded" />
                                                    {formatDate(interview.date)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                })()}
                            </div>

                            {/* Pagination */}
                            {(() => {
                                const totalPages = Math.ceil(filteredInterviews.length / interviewsPerPage)
                                if (totalPages <= 1) return null

                                return (
                                    <div className="interview-pagination">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                className={`interview-pagination-btn ${currentPage === page ? 'active' : ''}`}
                                                onClick={() => setCurrentPage(page)}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                )
                            })()}
                        </>
                    )}
                </div>
            </section >
            <Footer />
        </>

    )
}

export default ProgramDetails