import { useState, useEffect } from "react"
import Editor from "../../components/Editor/Editor"
import { useAuth } from "../../contexts/Auth"
import { Link } from 'react-router-dom'
import { Database } from "../../types/supabase"
import './Apply.scss'

type updateHackerApplicationTableType = Database["public"]["Tables"]["hacker_applications"]["Update"]
type autosavingLocationType = "basic_information" | "question_1" | "question_2" | null

const HackerApplication = ({ onReturnToDashboard } : { onReturnToDashboard: () => void }) => {
    const { supabase, user } = useAuth()

    const [applicationData, setApplicationData] = useState<updateHackerApplicationTableType>({})
    const [isOtherDietaryRestrictionChecked, setIsOtherDietaryRestrictionChecked] = useState(false)

    const [modifiedApplicationData, setModifiedApplicationData] = useState<updateHackerApplicationTableType>({})
    const [autosavingLocation, setAutosavingLocation] = useState<autosavingLocationType>(null)

    const [loading, setLoading] = useState(0)

    const firstName = `${useAuth().user?.user_metadata.first_name}`
    const lastName = `${useAuth().user?.user_metadata.last_name}`

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
    }

    const updateApplicationData = (column: keyof updateHackerApplicationTableType, value: string | boolean) => {
        
        setApplicationData((appData: updateHackerApplicationTableType) => ({
          ...appData,
          [column]: value,
        }))
        
        setModifiedApplicationData((appData: updateHackerApplicationTableType) => ({
            ...appData,
            [column]: value,
        }))
    }

    

    useEffect(() => {
        if (Object.keys(modifiedApplicationData).length === 0) return
        const handler = setTimeout(() => {
            const modifiedKey = Object.keys(modifiedApplicationData)[0]
            setAutosavingLocation(modifiedKey !== 'question_1' && modifiedKey !== 'question_2' ? 'basic_information' : modifiedKey)

            supabase.from('hacker_applications').update(modifiedApplicationData).eq('id', user?.id)
                .then(({ data, error }: { data: any, error: any}) => {
                    if (error) throw error;
                })
            setModifiedApplicationData({})
            setAutosavingLocation(null)
        }, 2500)

        return () => {
            clearTimeout(handler)
        }
    }, [modifiedApplicationData, supabase, user?.id])

    useEffect(() => {
        supabase.from('hacker_applications').select('*').eq('id', user?.id)
          .then(({ data, error }: { data: any, error: any }) => {
            const appData = data?.[0]
    
            if (error || !data || appData === null) {
                setLoading(1)
                alert('Oh no! Your data could not be retrieved. If this error persists, contact the RythmHacks team.')
                if (error) throw error;
                else throw TypeError('no hacker application matching the id was found')
            }
            else {
                setApplicationData(data[0])
                setLoading(2)
            }
          })
      }, [supabase, user?.id])

    if (loading === 0) {
        return <div className='lazy-preloader'></div>
    }
    else if (loading === 1) {
        return <div className='container'>
            <h1>Oh no!</h1>
            <p>Your data could not be retrieved. Try checking your internet connection. If this error persists, contact the RythmHacks team.</p>
        </div>
    }
    else return (<>
        <div className='container'>
        <h1>Hacker Application Form</h1>
        <p>Fill out this form to register for the event as a hacker. <button className='style-link p-0' onClick={onReturnToDashboard}>Go back to the dashboard.</button></p>
        </div>
        <div className='container mt-4'>
        <form onSubmit={handleSubmit} className='hacker-app-form'>
            <h3>Basic Information</h3>
            <p className={"relative" + autosavingLocation === 'basic_information' ? " hidden" : ""}>Saving...</p>
            <div>
                <label>First Name</label>
                <input 
                    value={firstName}
                    disabled
                    className='cursor-not-allowed'
                ></input>
            </div>
            <div>
                <label>Last Name</label>
                <input
                    value={lastName}
                    disabled
                    className='cursor-not-allowed'
                ></input>
            </div>
            <div>
                <label>Email</label>
                <input
                    value={user?.email}
                    disabled
                    className='cursor-not-allowed'
                ></input>
            </div>
            <p className='text-[#999] mb-4'>Want to change these values? Do so in the <Link to='/dashboard/settings'>settings</Link></p>
            <div>
            <label htmlFor="gender">Gender (optional)</label>
            <select
                id="gender"
                value={["Prefer not to say", "Male", "Female", "Non-binary"].includes(applicationData.gender || '') ? applicationData.gender : ''}
                onChange={e => {
                updateApplicationData('gender', e.target.value)
                }}
                >
                <option>Prefer not to say</option>
                <option>Male</option>
                <option>Female</option>
                <option>Non-binary</option>
                <option value="">Prefer to self-describe</option>
            </select>
            {!["Prefer not to say", "Male", "Female", "Non-binary"].includes(applicationData.gender || '') && (<>
                <label htmlFor="self-described-gender">Self-described Gender:</label>
                <input id="self-described-gender" value={applicationData.gender} onChange={e => {
                updateApplicationData('gender', e.target.value)
                }}></input>
            </>)}
            </div>


            <div>
            <label htmlFor="age">Age (as of September 1, 2023)</label>
            <input
                id="age"
                type="number"
                min={0}
                max={100}
                placeholder='Enter age'
                value={applicationData.age}
                onChange={e => updateApplicationData('age', e.target.value)}
            />
            </div>


            <div>
            <label htmlFor="grade">Grade (as of September 1, 2023)</label>
            <select
                id="grade"
                value={applicationData.grade}
                onChange={e => updateApplicationData('grade', e.target.value)}
            >
                <option value="">Please select a grade</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
                <option>Graduating</option>
            </select>
            </div>


            <div>
            <label htmlFor="school">School (don't abbreviate)</label>
            <input 
                id="school"
                value={applicationData.school}
                placeholder='Laurel Heights Secondary School'
                onChange={e => updateApplicationData('school', e.target.value)}
            />
            </div>


            <div>
            <label htmlFor="phone-number">Phone Number</label>
            <input
                id="phone-number"
                type="tel"
                value={applicationData.phone_number}
                placeholder='Enter phone number'
                onChange={e => updateApplicationData('phone_number', e.target.value)}
            ></input>
            </div>

        
            {/* <h3>Event-specific Information</h3>
            <div>
            <label htmlFor="t-shirt-size">T-Shirt Size (optional)</label>
            <select 
                id="t-shirt-size"
                value={applicationData.t_shirt_size}
                onChange={e => updateApplicationData('t_shirt_size', e.target.value)}
            >
                <option>Not Selected</option>
                <option>XS</option>
                <option>S</option>
                <option>M</option>
                <option>L</option>
                <option>XL</option>
            </select>
            </div>


            <div>
            <label>Dietary Restrictions</label>
            
            <div>
                <input 
                type="checkbox"
                id="dietary-restrictions-vegetarian"
                checked={applicationData.dietary_restrictions_vegetarian}
                onChange={e => updateApplicationData('dietary_restrictions_vegetarian', e.target.checked)} />
                <label htmlFor="dietary-restrictions-vegatarian" className="capitalize">Vegetarian</label>
            </div>

            <div>
                <input 
                type="checkbox"
                id="dietary-restrictions-halal"
                checked={applicationData.dietary_restrictions_halal}
                onChange={e => updateApplicationData('dietary_restrictions_halal', e.target.checked)} />
                <label htmlFor="dietary-restrictions-halal" className="capitalize">Halal</label>
            </div>

            <div>
                <input 
                type="checkbox"
                id="dietary-restrictions-gluten-free"
                checked={applicationData.dietary_restrictions_gluten_free}
                onChange={e => updateApplicationData('dietary_restrictions_gluten_free', e.target.checked)} />
                <label htmlFor="dietary-restrictions-gluten-free" className="capitalize">Gluten-Free</label>
            </div>

            <div>
                <input 
                type="checkbox"
                id="dietary-restrictions-dairy_free"
                checked={applicationData.dietary_restrictions_dairy_free}
                onChange={e => updateApplicationData('dietary_restrictions_dairy_free', e.target.checked)} />
                <label htmlFor="dietary-restrictions-dairy-free" className="capitalize">Dairy-Free</label>
            </div>


            <div>
                <input
                type="checkbox"
                id="other-dietary-restrictions-checkbox"
                name="dietary_restrictions"
                value={applicationData.dietary_restrictions_other}
                onChange={() => setIsOtherDietaryRestrictionChecked(!isOtherDietaryRestrictionChecked)}
                ></input>
                <label htmlFor="other-dietary-restrictions-checkbox">Other restriction(s)</label>
            </div>

            
            {isOtherDietaryRestrictionChecked && (<>
                <label htmlFor="other-dietary-restrictions-input">Restriction(s):</label>
                <input id="other-dietary-restrictions-input" value={applicationData.dietary_restrictions_other} onChange={e => {
                    updateApplicationData('dietary_restrictions_other', e.target.value)
                }}></input>
            </>)}
            </div> */}


            {/* <h3>Address</h3>
            <p>These fields are optional if you want to recieve prizes.</p>

            <div>
            <input 
                type="radio"
                name="country"
                id="canada"
                checked={applicationData.country === 'Canada'}
                onChange={() => updateApplicationData('country', 'Canada')}
            ></input>
            <label htmlFor="canada">Canada</label>


            <input
                type="radio"
                name="country"
                id="usa"
                checked={applicationData.country === 'United States of America'}
                onChange={() => updateApplicationData('country', 'United States of America')}
            ></input>
            <label htmlFor="usa">United States</label>


            <input
                type="radio"
                name="country"
                id="other-country-checkbox"
                checked={applicationData.country !== 'Canada' && applicationData.country !== 'United States of America'}
                onChange={() => updateApplicationData('country', '')}></input>
            <label htmlFor="other-country-checkbox">Other</label>

            {applicationData.country !== 'Canada' && applicationData.country !== 'United States of America' && (<>
                <label htmlFor="other-country-input">Country (No abbrevations):</label>
                <input id="other-country-input" value={applicationData.country} onChange={e => {
                    updateApplicationData('country', e.target.value)
                }}></input>
            </>)}
            </div>


            <div>
            <label htmlFor="province">Province</label>
            <input 
                id="province"
                placeholder="Ontario"
                value={applicationData.province}
                onChange={e => updateApplicationData('province', e.target.value)}
            />
            </div>


            <div>
            <label htmlFor="city">City</label>
            <input
                id="city"
                placeholder="Waterloo"
                value={applicationData.city}
                onChange={e => updateApplicationData('city', e.target.value)}
            />
            </div>


            <div>
            <label htmlFor="address">Address</label>
            <input
                id="address"
                placeholder="10 Main Street"
                value={applicationData.address}
                onChange={e => updateApplicationData('address', e.target.value)}
            />
            </div>

            <div>
            <label htmlFor="apartment_suite">Apartment, Suite, etc. (optional)</label>
            <input
                id="apartment_suite"
                placeholder="Unit 4"
                value={applicationData.apartment_suite}
                onChange={e => updateApplicationData('apartment_suite', e.target.value)}
            />
            </div>


            <div>
            <label htmlFor="postal-code">Postal Code</label>
            <input
                id="postal-code"
                placeholder="N2V 3Q8"
                value={applicationData.postal_code}
                onChange={e => updateApplicationData('postal_code', e.target.value)}
            />
            </div> */}
        

            <h3 className='mt-12'>Application Questions</h3>

            <h4>If you had the ability to create any app/website that would solve any problem in the world, what would it be? What technologies would you use? What features would it have?</h4>
            <Editor onEditorChange={html => updateApplicationData("question_1", html)}/>

            <h4 className="mt-8">What's something that you've always wanted to do, but you've never done? What personality traits or roadblocks have you faced that have prevented you from pursuing that idea? It could be a new skill you want to learn, a project you want to build, a business you want to start, anything you can think of!</h4>
            <Editor onEditorChange={html => updateApplicationData("question_1", html)}/>

            <div className='flex gap-2 mt-8'>
            <button className='contrast' onClick={() => onReturnToDashboard}>Save and return</button>
            <button type="submit">Submit</button>
            </div>
        </form>
        </div>
    </>)
}

export default HackerApplication;