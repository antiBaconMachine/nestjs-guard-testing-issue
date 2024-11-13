# Nest guard testing issue

I am struggling to get a guard to correctly fire for a graphql resolver.

There is one test suite in this project which shows a guard being applied to both a rest controller and a gql resolver. The guard correctly fires for the rest controller but not the gql resolver. If I run this as a server and use the gql playground I do get the 403 so it's something about the test setup specifically but I can't figure it out.

Any ideas?
