import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../css/AboutUs.css';
import ReactDOM from 'react-dom';

const AboutUs = () => {
    // Enhanced team data with achievements
    const teamData = {
        khang: {
            avatar: '/Gecko1.png',
            name: 'Nguyễn Minh Khang',
            role: 'CEO & Co-Founder',
            summary: 'Lãnh đạo tài ba với tầm nhìn chiến lược và kinh nghiệm sâu rộng',
            bio: 'Với 15+ năm kinh nghiệm trong ngành công nghệ, Khang đã dẫn dắt REPTISIST từ một startup nhỏ trở thành công ty hàng đầu khu vực. Anh là chuyên gia về strategic planning, business development và có tầm nhìn xa về tương lai của công nghệ. Trước khi thành lập REPTISIST, Khang đã từng làm việc tại các tập đoàn lớn như Microsoft và Google.',
            skills: ['Strategic Leadership', 'Business Development', 'Digital Transformation', 'Venture Capital', 'Market Analysis', 'Team Building'],
            achievements: [
                'Dẫn dắt REPTISIST từ 3 người thành 200+ nhân viên',
                'Phát triển doanh thu từ 0 lên 50M+ USD trong 12 năm',
                'Mở rộng thị trường ra 15+ quốc gia',
                'Gọi vốn thành công Series A, B, C tổng 100M+ USD',
                'Được Forbes vinh danh "40 Under 40" năm 2022'
            ],
            email: 'khang@REPTISIST.com',
            phone: '+84 901 234 567',
            linkedin: 'linkedin.com/in/khang-nguyen'
        },
        huong: {
            avatar: '/Gecko2.png',
            name: 'Trần Thu Hương',
            role: 'CTO & Co-Founder',
            summary: 'Chuyên gia AI hàng đầu với background học thuật mạnh mẽ',
            bio: 'Tiến sĩ Khoa học Máy tính từ MIT, Hương chịu trách nhiệm phát triển các sản phẩm công nghệ tiên tiến. Chuyên gia hàng đầu về AI, Machine Learning và Cloud Architecture với 12+ năm kinh nghiệm tại các tập đoàn công nghệ lớn như Facebook AI Research và DeepMind. Hương có hơn 50 bài báo khoa học được công bố.',
            skills: ['Artificial Intelligence', 'Machine Learning', 'Cloud Architecture', 'Data Science', 'System Design', 'Research'],
            achievements: [
                'PhD Computer Science từ MIT với GPA 4.0',
                '50+ bài báo khoa học được công bố trên Nature, Science',
                'Phát triển 5+ AI platform được sử dụng bởi 1M+ users',
                'Giải thưởng "Women in Tech Excellence" 2023',
                'TEDx speaker với 2M+ views về AI Ethics'
            ],
            email: 'huong@REPTISIST.com',
            phone: '+84 901 234 568',
            linkedin: 'linkedin.com/in/huong-tran'
        },
        anh: {
            avatar: '/Gecko3.png',
            name: 'Lê Đức Anh',
            role: 'Head of Design & UX',
            summary: 'Creative director với đam mê tạo ra trải nghiệm người dùng đặc biệt',
            bio: 'Với tài năng sáng tạo và hiểu biết sâu về UX/UI, Anh đảm bảo mọi sản phẩm của REPTISIST đều có trải nghiệm người dùng tuyệt vời. Anh từng làm việc tại Google Design và Facebook Reality Labs, mang đến những insights quý giá về design thinking và human-centered design. Anh cũng là co-founder của Vietnam UX Community.',
            skills: ['UX/UI Design', 'Design Thinking', 'Product Strategy', 'User Research', 'Prototyping', 'Design Systems'],
            achievements: [
                'Lead designer cho 3 ứng dụng có 10M+ downloads',
                'Red Dot Design Award 2022, 2023 winner',
                'Co-founder Vietnam UX Community (5000+ members)',
                'Speaker tại Adobe MAX, Figma Config',
                'Mentor cho 100+ designers trẻ'
            ],
            email: 'anh@REPTISIST.com',
            phone: '+84 901 234 569',
            linkedin: 'linkedin.com/in/anh-le'
        },
        mai: {
            avatar: '/Gecko2.png',
            name: 'Phạm Thị Mai',
            role: 'COO',
            summary: 'Operations expert với khả năng tối ưu hóa quy trình vượt trội',
            bio: 'MBA từ Harvard Business School, Mai có 12 năm kinh nghiệm trong operations và project management. Cô đảm bảo mọi dự án đều được thực hiện đúng tiến độ và chất lượng, đồng thời xây dựng quy trình vận hành hiệu quả cho toàn công ty. Mai từng làm việc tại McKinsey & Company và Amazon Operations.',
            skills: ['Operations Management', 'Project Management', 'Quality Assurance', 'Process Optimization', 'Team Leadership', 'Agile/Scrum'],
            achievements: [
                'Cải thiện efficiency 40% cho toàn bộ quy trình công ty',
                'Quản lý thành công 500+ projects với 99% on-time delivery',
                'Xây dựng ISO 9001:2015 certification cho REPTISIST',
                'Harvard Business Review case study subject',
                'Certified PMP và Agile Coach'
            ],
            email: 'mai@REPTISIST.com',
            phone: '+84 901 234 570',
            linkedin: 'linkedin.com/in/mai-pham'
        },
        tung: {
            avatar: '/Gecko2.png',
            name: 'Vũ Thanh Tùng',
            role: 'Head of R&D',
            summary: 'Research pioneer với focus vào breakthrough technologies',
            bio: 'Tiến sĩ Computer Science, chuyên gia về Blockchain và Quantum Computing. Tùng dẫn dắt đội ngũ nghiên cứu phát triển những công nghệ đột phá cho tương lai, luôn theo đuổi những innovation có thể thay đổi ngành công nghệ. Tùng từng làm việc tại IBM Research và có 8 patents về quantum algorithms.',
            skills: ['Blockchain', 'Quantum Computing', 'Research & Development', 'Innovation Strategy', 'Tech Leadership', 'Patent Filing'],
            achievements: [
                '8 patents về quantum computing và blockchain',
                'Lead researcher cho 3 breakthrough projects',
                'Published 30+ papers in top-tier conferences',
                'Vietnam National Innovation Award 2023',
                'Collaboration với MIT, Stanford on quantum research'
            ],
            email: 'tung@REPTISIST.com',
            phone: '+84 901 234 571',
            linkedin: 'linkedin.com/in/tung-vu'
        },
        thu: {
            avatar: '/Gecko2.png',
            name: 'Đặng Minh Thư',
            role: 'Head of People & Culture',
            summary: 'People champion với passion về talent development',
            bio: 'Chuyên gia về HR và organizational development với 10+ năm kinh nghiệm. Thư xây dựng văn hóa doanh nghiệp mạnh mẽ và chiến lược phát triển nhân tài cho REPTISIST. Cô từng làm việc tại Google People Operations và Airbnb Belong, mang đến expertise về diversity, inclusion và employee experience.',
            skills: ['Talent Management', 'Culture Building', 'Organizational Development', 'Diversity & Inclusion', 'Learning & Development', 'People Analytics'],
            achievements: [
                'Xây dựng culture giúp REPTISIST có 95% employee satisfaction',
                'Phát triển talent pipeline với 200+ engineers',
                'Great Place to Work certification 3 năm liên tiếp',
                'Diversity champion với 40% female leadership',
                'Keynote speaker tại HR conferences toàn cầu'
            ],
            email: 'thu@REPTISIST.com',
            phone: '+84 901 234 572',
            linkedin: 'linkedin.com/in/thu-dang'
        }
    };

    // Team interaction states
    const [modalMember, setModalMember] = useState(null);
    const [hoveredMember, setHoveredMember] = useState(null);

    // Counter animation
    const [counters, setCounters] = useState({});

    // Smooth scroll functionality
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // Counter animation
    const animateCounter = (target, setValue) => {
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            setValue(Math.floor(current));
        }, 16);
    };

    // Intersection Observer for animations
    useEffect(() => {
        const revealElements = document.querySelectorAll('.about-fade-in');
        
        const revealElementOnScroll = () => {
            revealElements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 150;
                
                if (elementTop < window.innerHeight - elementVisible) {
                    element.classList.add('about-visible');
                }
            });
        };

        window.addEventListener('scroll', revealElementOnScroll);
        revealElementOnScroll();

        // Counter observer
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-target'));
                    const key = entry.target.getAttribute('data-key');
                    // Chỉ chạy counter nếu chưa từng chạy (counters[key] === undefined)
                    if (typeof counters[key] === 'undefined') {
                        setCounters(prev => ({ ...prev, [key]: 0 }));
                        animateCounter(target, (value) => {
                            setCounters(prev => ({ ...prev, [key]: value }));
                        });
                    }
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.about-stat-number').forEach(counter => {
            counterObserver.observe(counter);
        });

        // Keyboard support
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && modalMember) {
                setModalMember(null);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('scroll', revealElementOnScroll);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [modalMember, counters]);

    useEffect(() => {
        if (modalMember) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [modalMember]);

    return (
        <div>
            <Header />
            <div className="about-bg-container">
                <div className="about-geometric-shapes">
                    <div className="about-shape"></div>
                    <div className="about-shape"></div>
                    <div className="about-shape"></div>
                    <div className="about-shape"></div>
                </div>
            </div>

            <section className="about-hero" id="home">
                <div className="about-hero-left">
                    <h1 className="about-hero-title">Chúng Tôi Là REPTISIST</h1>
                    <p className="about-hero-subtitle">Định hình tương lai thông qua công nghệ tiên tiến, sáng tạo không giới hạn và tầm nhìn đột phá cho kỷ nguyên số</p>
                    
                    <div className="about-hero-stats">
                        <div className="about-hero-stat">
                            <span className="about-hero-stat-number">12+</span>
                            <span className="about-hero-stat-label">Năm kinh nghiệm</span>
                        </div>
                        <div className="about-hero-stat">
                            <span className="about-hero-stat-number">500+</span>
                            <span className="about-hero-stat-label">Dự án thành công</span>
                        </div>
                        <div className="about-hero-stat">
                            <span className="about-hero-stat-number">200+</span>
                            <span className="about-hero-stat-label">Chuyên gia</span>
                        </div>
                    </div>
                    
                    <a 
                        href="#story" 
                        className="about-hero-cta"
                        onClick={(e) => {
                            e.preventDefault();
                            scrollToSection('story');
                        }}
                    >
                        Khám phá hành trình của chúng tôi
                        <span>→</span>
                    </a>
                </div>
                
                <div className="about-hero-right">
                    <div className="about-hero-visual">
                        <div className="about-hero-cards">
                            <div className="about-floating-card">
                                <h4 style={{color: '#00843D', marginBottom: '10px'}}>AI & Machine Learning</h4>
                                <p style={{color: '#DEE2E6', fontSize: '0.9rem'}}>Trí tuệ nhân tạo tiên tiến</p>
                            </div>
                            <div className="about-floating-card">
                                <h4 style={{color: '#0FA958', marginBottom: '10px'}}>Cloud Solutions</h4>
                                <p style={{color: '#DEE2E6', fontSize: '0.9rem'}}>Hạ tầng đám mây tối ưu</p>
                            </div>
                            <div className="about-floating-card">
                                <h4 style={{color: '#00843D', marginBottom: '10px'}}>Digital Transformation</h4>
                                <p style={{color: '#DEE2E6', fontSize: '0.9rem'}}>Chuyển đổi số toàn diện</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-section" id="story">
                <div className="about-story-section about-fade-in">
                    <h2 className="about-section-title">Câu Chuyện Của Chúng Tôi</h2>
                    
                    <div className="about-story-grid">
                        <div className="about-story-content">
                            <h3>Khởi Đầu Từ Ý Tưởng</h3>
                            <p>REPTISIST được thành lập vào năm 2013 với một tầm nhìn đơn giản nhưng đầy tham vọng: biến công nghệ thành công cụ mạnh mẽ để giải quyết những thách thức thực tế của doanh nghiệp và xã hội.</p>
                            <p>Bắt đầu từ một garage nhỏ với 3 thành viên sáng lập, chúng tôi đã không ngừng đổi mới và phát triển. Mỗi dòng code, mỗi sản phẩm đều được tạo ra với niềm đam mê và sự tận tâm.</p>
                        </div>
                        <div className="about-story-visual">🚀</div>
                    </div>
                    
                    <div className="about-story-grid">
                        <div className="about-story-visual">💡</div>
                        <div className="about-story-content">
                            <h3>Tầm Nhìn & Sứ Mệnh</h3>
                            <p>Tầm nhìn của chúng tôi là trở thành đối tác công nghệ hàng đầu Đông Nam Á, giúp các tổ chức chuyển đổi số thành công và bền vững trong kỷ nguyên 4.0.</p>
                            <p>Sứ mệnh của REPTISIST là tạo ra những sản phẩm công nghệ không chỉ đáp ứng nhu cầu hiện tại mà còn dự đoán và chuẩn bị cho tương lai, mang lại giá trị bền vững cho khách hàng và cộng đồng.</p>
                        </div>
                    </div>
                    
                    <div className="about-story-grid">
                        <div className="about-story-content">
                            <h3>Triết Lý Phát Triển</h3>
                            <p>Chúng tôi tin rằng công nghệ không chỉ là công cụ, mà là cầu nối giữa ý tưởng và hiện thực, giữa thách thức và cơ hội. Mỗi giải pháp được thiết kế với philosophy "Technology for Humanity".</p>
                            <p>Từ những dự án đầu tiên cho các SME địa phương đến việc phát triển hệ thống enterprise cho các tập đoàn đa quốc gia, chúng tôi luôn đặt con người và tác động xã hội làm trung tâm.</p>
                        </div>
                        <div className="about-story-visual">🌟</div>
                    </div>
                </div>
            </section>

            <section className="about-values-section about-fade-in" id="values">
                <div className="about-container">
                    <h2 className="about-section-title">Giá Trị Cốt Lõi</h2>
                    
                    <div className="about-values-container">
                        <div className="about-value-card">
                            <span className="about-value-icon">🚀</span>
                            <h3>Innovation First</h3>
                            <p>Tiên phong áp dụng công nghệ mới nhất từ AI, Machine Learning, Blockchain đến Quantum Computing. Mỗi dự án là cơ hội thử nghiệm ý tưởng đột phá.</p>
                        </div>
                        
                        <div className="about-value-card">
                            <span className="about-value-icon">🤝</span>
                            <h3>Partnership Excellence</h3>
                            <p>Xây dựng mối quan hệ lâu dài dựa trên trust, transparency và quality commitment. Chúng tôi là strategic advisor, không chỉ là service provider.</p>
                        </div>
                        
                        <div className="about-value-card">
                            <span className="about-value-icon">⚡</span>
                            <h3>Efficiency Mastery</h3>
                            <p>Tối ưu quy trình với Agile, DevOps và lean methodology. Delivery nhanh chóng mà không compromise quality, maximize ROI cho khách hàng.</p>
                        </div>
                        
                        <div className="about-value-card">
                            <span className="about-value-icon">🌱</span>
                            <h3>Sustainable Growth</h3>
                            <p>Commit phát triển green technology, minimize environmental impact. Building sustainable future cho next generation thông qua responsible innovation.</p>
                        </div>
                        
                        <div className="about-value-card">
                            <span className="about-value-icon">🎯</span>
                            <h3>Customer Centricity</h3>
                            <p>Customer needs và goals là center của mọi decision. Listen, understand và create solutions thực sự solve core problems của khách hàng.</p>
                        </div>
                        
                        <div className="about-value-card">
                            <span className="about-value-icon">🔒</span>
                            <h3>Security Excellence</h3>
                            <p>Apply highest industry security standards từ architecture design đến deployment. Customer data protection với advanced encryption technologies.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-team-section about-fade-in" id="team">
                <div className="about-team-container">
                    <div className="about-team-header">
                        <h2>Đội Ngũ Lãnh Đạo</h2>
                        <p>Gặp gỡ những con người tài năng đang định hình tương lai của REPTISIST. Mỗi thành viên đều mang trong mình niềm đam mê công nghệ và tầm nhìn đổi mới.</p>
                    </div>
                    <div className="about-team-gallery">
                        <div className="about-team-cards-row no-wrap">
                            {Object.entries(teamData).filter(([key]) => key !== 'thu').map(([key, member]) => (
                                <div
                                    key={key}
                                    className={`about-team-member-card${hoveredMember === key ? ' about-focused' : ' about-blur'}`}
                                    onMouseEnter={() => setHoveredMember(key)}
                                    onMouseLeave={() => setHoveredMember(null)}
                                    onClick={() => setModalMember(member)}
                                >
                                    <div className="about-member-image">
                                        {member.avatar && member.avatar.endsWith('.png') ? (
                                            <img src={member.avatar} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0' }} />
                                        ) : (
                                            member.avatar
                                        )}
                                    </div>
                                    <div className="about-member-overlay">
                                        <div className="about-member-name">{member.name}</div>
                                        <div className="about-member-role">{member.role}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Modal */}
                        {modalMember && ReactDOM.createPortal(
                            <div className="about-team-modal-overlay" onClick={() => setModalMember(null)}>
                                <div className="about-team-modal" onClick={e => e.stopPropagation()}>
                                    <button className="about-close-detail" onClick={() => setModalMember(null)}>×</button>
                                    <div className="about-team-modal-content">
                                        <div className="about-team-modal-avatar">
                                            <div className="about-detail-avatar">
                                                {modalMember.avatar && modalMember.avatar.endsWith('.png') ? (
                                                    <img src={modalMember.avatar} alt={modalMember.name} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '50%' }} />
                                                ) : (
                                                    modalMember.avatar
                                                )}
                                            </div>
                                        </div>
                                        <div className="about-team-modal-info">
                                            <div className="about-detail-name">{modalMember.name}</div>
                                            <div className="about-detail-role">{modalMember.role}</div>
                                            <div className="about-detail-summary">{modalMember.summary}</div>
                                            <div className="about-detail-section">
                                                <h4>📖 Câu Chuyện</h4>
                                                <p>{modalMember.bio}</p>
                                            </div>
                                            <div className="about-detail-section">
                                                <h4>🚀 Chuyên Môn</h4>
                                                <div className="about-skills-grid">
                                                    {modalMember.skills.map((skill, index) => (
                                                        <span key={index} className="about-skill-tag">{skill}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="about-detail-section">
                                                <h4>🏆 Thành Tựu</h4>
                                                <ul className="about-achievements-list">
                                                    {modalMember.achievements.map((achievement, index) => (
                                                        <li key={index}>{achievement}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="about-detail-section">
                                                <h4>📞 Liên Hệ</h4>
                                                <div className="about-contact-grid">
                                                    <div className="about-contact-item">
                                                        <div className="about-contact-icon">📧</div>
                                                        <span>{modalMember.email}</span>
                                                    </div>
                                                    <div className="about-contact-item">
                                                        <div className="about-contact-icon">📱</div>
                                                        <span>{modalMember.phone}</span>
                                                    </div>
                                                    <div className="about-contact-item">
                                                        <div className="about-contact-icon">💼</div>
                                                        <span>{modalMember.linkedin}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>,
                            document.body
                        )}
                    </div>
                </div>
            </section>

            <div className="about-stats-section about-fade-in">
                <div className="about-container">
                    <h2 className="about-section-title">Thành Tựu Đáng Tự Hào</h2>
                    
                    <div className="about-stats-grid">
                        <div className="about-stat-item">
                            <span 
                                className="about-stat-number" 
                                data-target="500" 
                                data-key="projects"
                            >
                                {counters.projects || 0}
                            </span>
                            <div className="about-stat-label">Dự Án Thành Công</div>
                            <div className="about-stat-description">Từ startup đến enterprise</div>
                        </div>
                        
                        <div className="about-stat-item">
                            <span 
                                className="about-stat-number" 
                                data-target="200" 
                                data-key="customers"
                            >
                                {counters.customers || 0}
                            </span>
                            <div className="about-stat-label">Khách Hàng Tin Tưởng</div>
                            <div className="about-stat-description">Trên 15 quốc gia</div>
                        </div>
                        
                        <div className="about-stat-item">
                            <span 
                                className="about-stat-number" 
                                data-target="200" 
                                data-key="experts"
                            >
                                {counters.experts || 0}
                            </span>
                            <div className="about-stat-label">Chuyên Gia Công Nghệ</div>
                            <div className="about-stat-description">Đội ngũ đa quốc gia</div>
                        </div>
                        
                        <div className="about-stat-item">
                            <span 
                                className="about-stat-number" 
                                data-target="12" 
                                data-key="years"
                            >
                                {counters.years || 0}
                            </span>
                            <div className="about-stat-label">Năm Kinh Nghiệm</div>
                            <div className="about-stat-description">Từ 2013 đến nay</div>
                        </div>
                        
                        <div className="about-stat-item">
                            <span 
                                className="about-stat-number" 
                                data-target="50" 
                                data-key="awards"
                            >
                                {counters.awards || 0}
                            </span>
                            <div className="about-stat-label">Giải Thưởng</div>
                            <div className="about-stat-description">Công nghệ & đổi mới</div>
                        </div>
                        
                        <div className="about-stat-item">
                            <span 
                                className="about-stat-number" 
                                data-target="99" 
                                data-key="satisfaction"
                            >
                                {counters.satisfaction || 0}
                            </span>
                            <div className="about-stat-label">% Khách Hàng Hài Lòng</div>
                            <div className="about-stat-description">Đánh giá trung bình</div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="about-cta-section about-fade-in" id="contact">
                <div className="about-cta-left">
                    <div className="about-cta-content">
                        <h2>Sẵn Sàng Tạo Nên Điều Kỳ Diệu?</h2>
                        <p>Hãy để chúng tôi đồng hành cùng bạn trong hành trình chuyển đổi số. Từ ý tưởng đến hiện thực, từ thách thức đến cơ hội - REPTISIST là đối tác tin cậy cho mọi dự án công nghệ của bạn.</p>
                        
                        <div className="about-cta-buttons">
                            <a href="#contact" className="about-cta-button">Bắt đầu dự án ngay</a>
                            <a href="#portfolio" className="about-cta-button about-secondary">Xem portfolio</a>
                        </div>
                    </div>
                </div>
                
                <div className="about-cta-right">
                    🚀
                </div>
            </section>
            <Footer />
        </div>
    );
};

export default AboutUs;