import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import ErrorMessage from './ErrorMessage'
import { withRouter } from 'next/router'
import marked from 'marked'
import Moment from 'react-moment'
import 'moment-timezone'

const Post = (props) => {
  const { id, router: { asPath }, data } = props;
  let html = { __html: marked(data.post.content) }

  return (
    <div>
      <div>#{data.post.id}</div>
      <Moment format="YYYY-MM-DD">{data.post.datetime}</Moment>

      <h1>{data.post.title}</h1>
      <div dangerouslySetInnerHTML={html}></div>
    </div>
  )
}

export const getPost = gql`
  query getPost($id: ID!) {
    post(id: $id) {
      id
      title
      content
      datetime
    }
  }
`

export default graphql(getPost, {
  options: (props) => ({
    variables: {
      id: props.id
    }
  })
})(withRouter(Post));
