<template>
    <div class="breadcrumbs">
        <ul class="row">
            <li class="breadcrumb-item">
                <nuxt-link to="/" title="Back to Home">Home</nuxt-link>
            </li>
            <li class="breadcrumb-item" v-for="(element, index) in path" :key="index">
                <nuxt-link :to="'/'+element.url">
                    <span itemprop="title">{{ element.name }}</span>
                </nuxt-link>
            </li>
        </ul>
    </div>
</template>

<script>
    export default {
        name: "Breadcrumbs",
        props: {
            path: {
                required: true,
                type: Array
            }
        },

        head () {
            if(!_.isEmpty(this.path)){
                let currentPath = [];
                _.forEach(this.path, (pathItem, key) => {
                    currentPath.push({
                        "@type": "ListItem",
                        "position": key+1,
                        "name": pathItem.name,
                        "item": process.env.APP_BASE_URL + pathItem.url
                    })
                });
                let structuredDataBreadcrumbs = {
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": currentPath
                };
                return{
                    script: [
                        { json: structuredDataBreadcrumbs, type: 'application/ld+json' }
                    ]
                }
            }
        }
    }
</script>
