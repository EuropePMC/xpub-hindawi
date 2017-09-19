A page for a reviewer to submit a review of a version of a project.

```js
const { reduxForm } = require('redux-form');

const project = {
  id: faker.random.uuid(),
  reviewers: [
      {
        id: 'reviewer-invited',
        name: faker.name.findName(),
      },
      {
        id: 'reviewer-accepted',
        name: faker.name.findName(),
      },
      {
        id: 'reviewer-reviewed',
        name: faker.name.findName(),
        ordinal: 1
      }
  ]
};

const versions = [
  {
    id: faker.random.uuid(),
    submitted: faker.date.past(2),
    declarations: {
      openReview: true
    },
    files: {
      supplementary: [
        
      ]
    },
    reviews: [
      {
        id: faker.random.uuid(),
        reviewer: 'reviewer-reviewed',
        status: 'reviewed',
        events: {
          invited: faker.date.past(2),
          accepted: faker.date.past(2),
          reviewed: faker.date.past(2),
        },
        note: {
          content: '<p>This is a review</p>'
        },
        recommendation: 'accept'
      },
    ]
  },
  {
      id: faker.random.uuid(),
      submitted: faker.date.past(1),
      declarations: {
        openReview: true
      },
      files: {
            supplementary: [
              
            ]
          },
      reviews: [
        {
            id: faker.random.uuid(),
            reviewer: 'reviewer-reviewed',
            status: 'reviewed',
            events: {
              invited: faker.date.past(1),
              accepted: faker.date.past(1),
              reviewed: faker.date.past(1),
            },
            note: {
              content: '<p>This is another review</p>'
            },
            recommendation: 'accept'
          }
      ]
  },
  {
        id: faker.random.uuid(),
        submitted: faker.date.past(1),
        declarations: {
          openReview: true
        },
        files: {
              supplementary: [
                
              ]
            },
        reviews: [
          {
              id: faker.random.uuid(),
              reviewer: 'reviewer-reviewed',
              status: 'accepted',
              events: {
                invited: faker.date.past(1),
                accepted: faker.date.past(1),
              }
            }
        ]
    }
];

const reviewer = {
  id: 'reviewer-reviewed'
};

const version = versions[versions.length - 1];
const review = version.reviews.find(review => review.reviewer === reviewer.id);

const ConnectedReviewLayout= reduxForm({ 
  form: 'review-layout',
  onSubmit: values => console.log(values),
  onChange: values => console.log(values)
})(ReviewLayout);

<div style={{position:'relative', height: 600}}>
    <ConnectedReviewLayout
        project={project}
        versions={versions}
        initialValues={review}
        reviewer={reviewer}/>
</div>
```