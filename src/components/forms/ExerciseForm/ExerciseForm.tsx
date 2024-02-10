import { css } from '@emotion/react'
import React from 'react'
import { addExerciseLogToCloud } from '../../../helpers/exercise-log/addExerciseLogToCloud'
import { prep } from '../../../helpers/prepareFractionalInputForSubmission'
import { round } from '../../../helpers/round'
import { Profile } from '../../../models/profile'
import { md } from '../../../theme'
import {
  LiftingActivity,
  liftingMET,
  OtherActivity,
  otherMet,
  SwimmingActivity,
  swimmingMET,
} from './constants'
import { calculateCaloriesFromMETs } from './helpers/calculateCaloriesFromMETs'
import { getMETsFromInput } from './helpers/getMETsFromInput'

export const group = [
  'Cycling',
  'Lifting',
  'Rowing',
  'Running',
  'Swimming',
  'Walking',
  'Other',
  'Custom',
] as const
export type ExerciseGroup = (typeof group)[number]

type props = { profile: Profile }
export const ExerciseForm: React.FC<props> = ({ profile }) => {
  const { metricSystem } = profile
  const [weight, updateWeight] = React.useState('')
  const [minutes, setMinutes] = React.useState('')
  const [watt, setWatts] = React.useState('')
  const [mph, setMph] = React.useState('')
  const [incline, setIncline] = React.useState('')
  const [calories, setCalories] = React.useState('')
  const [exerciseGroup, setExerciseGroup] = React.useState(
    'Custom' as ExerciseGroup
  )
  const [otherActivity, setOtherActivity] = React.useState(
    'Baseball' as OtherActivity
  )
  const [swimmingActivity, setSwimmingActivity] = React.useState(
    'Backstroke' as SwimmingActivity
  )
  const [liftingActivity, setLiftingActivity] = React.useState(
    'Machines' as LiftingActivity
  )

  const groupButtonStyling = css`
    min-width: 20%;

    @media (max-width: ${md}px) {
      flex: 1;
      min-width: 45%;
    }
  `

  const otherButtons = css`
    min-width: 25%;
  `

  const groupButton = (g: ExerciseGroup) => (
    <button
      onClick={() => setExerciseGroup(g)}
      type="button"
      css={groupButtonStyling}
      className={`expand background ${g === exerciseGroup ? 'active' : ''}`}
      key={g}
    >
      {g}
    </button>
  )

  const label = css`
    margin-top: 0;
  `

  return (
    <div className="w100">
      <form
        css={css`
          > div > button {
            font-size: 0.9rem;
            margin: 5px;
          }
        `}
        onSubmit={(event) => {
          event.preventDefault()
          const MET = getMETsFromInput(
            exerciseGroup,
            otherActivity,
            swimmingActivity,
            liftingActivity,
            // When metric is true, mph is actually is kph.  When metric is false, mph is mph
            metricSystem ? Number(mph) * 0.6213711922 : Number(mph),
            Number(incline),
            Number(watt)
          )
          // If MET === -1, then no valid MET was found
          // Thus, we definitely don't want to submit a request using a bad MET!
          if (MET !== -1) {
            const amount =
              // Custom is when the user just adds the calories directly
              // Hence, you don't need to calculate calories from METS
              exerciseGroup === 'Custom'
                ? Number(calories)
                : calculateCaloriesFromMETs(
                    // When metric is true, weight is kg.  When metric is false, it is lbs
                    metricSystem
                      ? Number(weight) * 2.2046226218
                      : Number(weight),
                    Number(minutes),
                    MET
                  )
            addExerciseLogToCloud({
              amount: round(amount, 0),
              category:
                exerciseGroup === 'Lifting'
                  ? liftingActivity
                  : exerciseGroup === 'Swimming'
                    ? swimmingActivity
                    : exerciseGroup === 'Custom'
                      ? otherActivity
                      : null,
              duration: prep(minutes),
              groupName: exerciseGroup,
              incline: prep(incline),
              name: '',
              pace: prep(mph),
              power: prep(watt),
              weight: prep(weight),
            })
          }
        }}
      >
        {exerciseGroup !== 'Custom' && (
          <div className="group">
            <div className="w50">
              <label htmlFor="weight">
                Weight
                <span className="pink tag">{metricSystem ? 'kg' : 'lbs'}</span>
              </label>
              <input
                placeholder="200"
                id="weight"
                onChange={(event) => {
                  updateWeight(event.target.value)
                }}
                value={weight}
                type="number"
                autoComplete={'off'}
                autoCorrect={'off'}
                autoCapitalize={'off'}
                step="any"
                required
              />
            </div>
            <div className="w50">
              <label htmlFor="minutes">
                Duration
                <span className="pink tag">Minutes</span>
              </label>
              <input
                placeholder="60"
                id="minutes"
                onChange={(event) => {
                  setMinutes(event.target.value)
                }}
                value={minutes}
                type="number"
                autoComplete={'off'}
                autoCorrect={'off'}
                autoCapitalize={'off'}
                step="any"
                required
              />
            </div>
          </div>
        )}

        {/* Group buttons */}
        <div className="fr wrap mt30 mb30 w100">
          {group.map((g) => groupButton(g))}
        </div>

        {/* Other buttons */}

        {exerciseGroup === 'Other' && (
          <div className="fr wrap">
            {Object.keys(otherMet).map((key) => (
              <button
                type="button"
                onClick={() => setOtherActivity(key as OtherActivity)}
                css={[groupButtonStyling, otherButtons]}
                className={`blue expand ${
                  key === otherActivity ? 'active' : ''
                }`}
                key={key}
              >
                {key}
              </button>
            ))}
          </div>
        )}

        {exerciseGroup === 'Swimming' && (
          <div className="fr wrap">
            {Object.keys(swimmingMET).map((key) => (
              <button
                type="button"
                onClick={() => setSwimmingActivity(key as SwimmingActivity)}
                className={`blue expand ${
                  key === swimmingActivity ? 'active' : ''
                }`}
                key={key}
              >
                {key}
              </button>
            ))}
          </div>
        )}

        {exerciseGroup === 'Lifting' && (
          <div className="fr wrap">
            {Object.keys(liftingMET).map((key) => (
              <button
                type="button"
                onClick={() => setLiftingActivity(key as LiftingActivity)}
                className={`blue expand ${
                  key === liftingActivity ? 'active' : ''
                }`}
                key={key}
              >
                {key}
              </button>
            ))}
          </div>
        )}

        {['Running', 'Cycling'].includes(exerciseGroup) && (
          <div className="group">
            <div className="w100">
              <label css={label} htmlFor="miles">
                Pace
                <span className="pink tag">{metricSystem ? 'kph' : 'mph'}</span>
              </label>
              <input
                placeholder="3"
                id="mph"
                onChange={(event) => {
                  setMph(event.target.value)
                }}
                value={mph}
                type="number"
                autoComplete={'off'}
                autoCorrect={'off'}
                autoCapitalize={'off'}
                step="any"
                required
              />
            </div>
          </div>
        )}

        {exerciseGroup === 'Rowing' && (
          <div className="group">
            <div className="w100">
              <label css={label} htmlFor="watt">
                Power
                <span className="pink tag">Watts</span>
              </label>
              <input
                placeholder="100"
                id="watt"
                onChange={(event) => {
                  setWatts(event.target.value)
                }}
                value={watt}
                type="number"
                autoComplete={'off'}
                autoCorrect={'off'}
                autoCapitalize={'off'}
                step="any"
                required
              />
            </div>
          </div>
        )}

        {exerciseGroup === 'Walking' && (
          <div className="group">
            <div className="w50">
              <label css={label} htmlFor="pace">
                Pace
                <span className="pink tag">{metricSystem ? 'kph' : 'mph'}</span>
              </label>
              <input
                placeholder="3"
                id="pace"
                onChange={(event) => {
                  setMph(event.target.value)
                }}
                value={mph}
                type="number"
                autoComplete={'off'}
                autoCorrect={'off'}
                autoCapitalize={'off'}
                step="any"
                required
              />
            </div>
            <div className="w50">
              <label css={label} htmlFor="incline">
                Incline
                <span className="pink tag">%</span>
              </label>
              <input
                placeholder="3"
                id="incline"
                onChange={(event) => {
                  setIncline(event.target.value)
                }}
                value={incline}
                type="number"
                autoComplete={'off'}
                autoCorrect={'off'}
                autoCapitalize={'off'}
                step="any"
                required
              />
            </div>
          </div>
        )}

        {exerciseGroup === 'Custom' && (
          <div className="group">
            <div className="w100">
              <label css={label} htmlFor="calories">
                Calories burned
              </label>
              <input
                placeholder="100"
                id="calories"
                onChange={(event) => {
                  setCalories(event.target.value)
                }}
                value={calories}
                type="number"
                autoComplete={'off'}
                autoCorrect={'off'}
                autoCapitalize={'off'}
                step="any"
                required
              />
            </div>
          </div>
        )}

        <button type="submit" className="purple bold mt30 mb10">
          Add calories burned
        </button>
      </form>
    </div>
  )
}
