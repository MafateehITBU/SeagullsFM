import React, { useState, useEffect, useRef } from 'react'
import axiosInstance from '../axiosConfig'
import { useStaticInfo } from '../context/StaticInfoContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import { Icon } from '@iconify/react'
import 'react-toastify/dist/ReactToastify.css'

import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import Input from '../components/UI/Input'
import getDiscoveredBg from '../assets/imgs/get-discovered.png'

const GetDiscovered = () => {
    const { staticInfo } = useStaticInfo();
    const { user } = useAuth();
    const navigate = useNavigate();
    const isLoggedIn = user && user.id;
    
    // Genre options from UploadTrack model
    const genreOptions = [
        "Pop",
        "Rock",
        "Hip Hop",
        "Rap",
        "R&B",
        "Country",
        "Jazz",
        "Classical",
        "Electronic",
        "Dance",
        "Reggae",
        "Blues",
        "Folk",
        "Metal",
        "Punk",
        "Alternative",
        "Indie",
        "Latin",
        "World",
        "Gospel",
        "Soul",
        "Funk",
        "Disco",
        "House",
        "Techno",
        "Trance",
        "Dubstep",
        "Ambient",
        "Other",
    ];

    const [formData, setFormData] = useState({
        songName: '',
        genre: '',
        songFile: null,
    })

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenreOpen, setIsGenreOpen] = useState(false);
    const genreDropdownRef = useRef(null);
    const songFileInputRef = useRef(null);

    // Validation functions
    const validateSongName = (songName) => {
        if (!songName.trim()) {
            return 'Song name is required';
        }
        return '';
    }

    const validateGenre = (genre) => {
        if (!genre.trim()) {
            return 'Genre is required';
        }
        return '';
    }

    const validateSongFile = (songFile) => {
        if (!songFile) {
            return 'Song file is required';
        }
        return '';
    }

    const validateForm = () => {
        const newErrors = {};
        newErrors.songName = validateSongName(formData.songName);
        newErrors.genre = validateGenre(formData.genre);
        newErrors.songFile = validateSongFile(formData.songFile);
        setErrors(newErrors);
        // Check if there are any actual errors (non-empty strings)
        const hasErrors = Object.values(newErrors).some(error => error !== '');
        if (hasErrors) {
            toast.error('Please fill in all required fields');
        }
        return !hasErrors;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    }

    const handleFileChange = (e) => {
        if (!isLoggedIn) {
            toast.error('Please log in to upload a track');
            navigate('/login');
            return;
        }
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                songFile: file
            });
            // Clear error
            if (errors.songFile) {
                setErrors({
                    ...errors,
                    songFile: ''
                });
            }
        }
    }

    const handleSongFileClick = () => {
        if (!isLoggedIn) {
            toast.error('Please log in to upload a track');
            navigate('/login');
            return;
        }
        if (songFileInputRef.current) {
            songFileInputRef.current.click();
        }
    }

    const toggleGenreDropdown = () => {
        setIsGenreOpen((prev) => !prev);
    }

    const handleGenreSelect = (genre) => {
        setFormData({
            ...formData,
            genre
        });

        if (errors.genre) {
            setErrors({
                ...errors,
                genre: ''
            });
        }

        setIsGenreOpen(false);
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target)) {
                setIsGenreOpen(false);
            }
        };

        if (isGenreOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isGenreOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isLoggedIn) {
            toast.error('Please log in to upload a track');
            navigate('/login');
            return;
        }
        
        const isValid = validateForm();
        if (!isValid) {
            console.log('Validation failed', errors);
            return;
        }
        
        if (!staticInfo?.channelId) {
            toast.error('Channel information is missing. Please refresh the page.');
            return;
        }
        
        setIsSubmitting(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('songName', formData.songName.trim());
            formDataToSend.append('genre', formData.genre.trim());
            formDataToSend.append('songFile', formData.songFile);
            formDataToSend.append('channelId', staticInfo?.channelId);

            const response = await axiosInstance.post('/uploadtrack', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log('Response:', response);
            
            if (response.status === 201) {
                toast.success('Song submitted successfully');
                setFormData({
                    songName: '',
                    genre: '',
                    songFile: null,
                })
                setErrors({});
                // Reset file input
                if (songFileInputRef.current) {
                    songFileInputRef.current.value = '';
                }
            }
        } catch (error) {
            console.error('Error submitting:', error);
            toast.error(error.response?.data?.message || 'Failed to submit song');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <Header />
            <ToastContainer />

            <section className="get-discovered-section">
                {/* Background Image - Under the whole section */}
                <div className="get-discovered-image-wrapper">
                    <img src={getDiscoveredBg} alt="Get Discovered Background" className="get-discovered-image" />
                    <div className="get-discovered-overlay"></div>
                </div>

                {/* Content */}
                <div className="get-discovered-container">
                    <div className="get-discovered-content flex-column-center">
                        <h2 className="get-discovered-title">Get Discovered</h2>
                        <p className="get-discovered-description text-center">
                            Share your original music with Mood FM and get discovered by <br/> our team
                        </p>

                        <form className="get-discovered-form" onSubmit={handleSubmit}>
                            <Input
                                variant="talent"
                                type="text"
                                name="songName"
                                placeholder="Enter your song name"
                                value={formData.songName}
                                onChange={handleChange}
                                label="Song Name"
                                icon="material-symbols:music-note"
                                focusColor="yellow"
                                error={errors.songName}
                                disabled={!isLoggedIn}
                            />

                            {/* Genre Dropdown */}
                            <div className="talent-form-group">
                                <label className="talent-form-label">
                                    Genre
                                </label>
                                <div 
                                    ref={genreDropdownRef}
                                    className={`talent-form-input-wrapper input-focus-yellow genre-dropdown-wrapper ${isGenreOpen ? 'open' : ''} ${!isLoggedIn ? 'genre-dropdown-disabled' : ''}`}
                                    onClick={(e) => {
                                        if (!isLoggedIn) {
                                            toast.error('Please log in to upload a track');
                                            navigate('/login');
                                            return;
                                        }
                                        e.stopPropagation();
                                        e.preventDefault();
                                        toggleGenreDropdown();
                                    }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                    }}
                                >
                                    <Icon 
                                        icon="material-symbols:music-note" 
                                        className="talent-form-icon"
                                    />
                                    <div className={`genre-dropdown-display talent-form-input ${errors.genre ? 'talent-form-input-error' : ''}`}>
                                        {formData.genre || 'Select a genre'}
                                    </div>
                                    <Icon 
                                        icon={isGenreOpen ? 'material-symbols:arrow-drop-up' : 'material-symbols:arrow-drop-down'}
                                        className="genre-dropdown-arrow"
                                    />
                                    {isGenreOpen && (
                                        <div 
                                            className="genre-dropdown-backdrop"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setIsGenreOpen(false);
                                            }}
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                            }}
                                        />
                                    )}
                                    <div 
                                        className="genre-dropdown-menu"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                        }}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                        }}
                                    >
                                        {genreOptions.map((genre) => (
                                            <div
                                                key={genre}
                                                className={`genre-dropdown-option ${formData.genre === genre ? 'selected' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    handleGenreSelect(genre);
                                                }}
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                }}
                                            >
                                                {genre}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {errors.genre && (
                                    <span className="talent-form-error">
                                        {errors.genre}
                                    </span>
                                )}
                            </div>

                            {/* File Input */}
                            <div className="talent-form-group">
                                <label className="talent-form-label">
                                    Song File
                                </label>
                                <div 
                                    className={`song-file-dropzone ${!isLoggedIn ? 'song-file-dropzone-disabled' : ''} ${formData.songFile ? 'song-file-dropzone-has-file' : ''} ${isGenreOpen ? 'song-file-dropzone-dropdown-open' : ''}`}
                                    onClick={handleSongFileClick}
                                    onDragOver={(e) => {
                                        if (!isLoggedIn) {
                                            e.preventDefault();
                                            return;
                                        }
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onDrop={(e) => {
                                        if (!isLoggedIn) {
                                            e.preventDefault();
                                            toast.error('Please log in to upload a track');
                                            navigate('/login');
                                            return;
                                        }
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                            const fakeEvent = { target: { files: e.dataTransfer.files } };
                                            handleFileChange(fakeEvent);
                                        }
                                    }}
                                >
                                    {formData.songFile ? (
                                        <>
                                            <Icon 
                                                icon="material-symbols:check-circle"
                                                className="song-file-check-icon"
                                            />
                                            <p className="song-file-title">
                                                {formData.songFile.name}
                                            </p>
                                            <p className="song-file-subtitle">
                                                {(formData.songFile.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                            <span 
                                                className="song-file-change-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSongFileClick();
                                                }}
                                            >
                                                <Icon 
                                                    icon="material-symbols:edit"
                                                    className="song-file-upload-icon"
                                                />
                                                <span>Change File</span>
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Icon 
                                                icon="material-symbols:cloud-upload"
                                                className="song-file-main-icon"
                                            />
                                            <p className="song-file-title">
                                                Drag <span className='ampersand-fallback' >&amp;</span> Drop your track here
                                            </p>
                                            <p className="song-file-subtitle">
                                                MP3 / WAV · MAX 20MB
                                            </p>
                                            <span>
                                                <Icon 
                                                    icon="material-symbols:upload"
                                                    className="song-file-upload-icon"
                                                />
                                                <span>Upload Track</span>
                                            </span>
                                        </>
                                    )}

                                    <input
                                        ref={songFileInputRef}
                                        type="file"
                                        name="songFile"
                                        // Accepts audio and video files
                                        accept="audio/*, video/*"
                                        onChange={handleFileChange}
                                        className="song-file-input-hidden"
                                    />
                                </div>
                                {errors.songFile && (
                                    <span className="talent-form-error">
                                        {errors.songFile}
                                    </span>
                                )}
                            </div>

                            <div className="talent-form-submit-wrapper">
                                <button
                                    type="submit"
                                    className="get-discovered-submit-btn"
                                    disabled={isSubmitting || !isLoggedIn}
                                >
                                    {isSubmitting ? 'SUBMITTING...' : !isLoggedIn ? 'PLEASE LOG IN TO UPLOAD' : 'SUBMIT'}
                                </button>
                            </div>
                            
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    )
}

export default GetDiscovered