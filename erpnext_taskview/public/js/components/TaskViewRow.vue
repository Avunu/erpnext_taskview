<template>
    <div class="row">
        <div class="col-md-2">
            <p>{{ doc.subject }}</p>
        </div>
        <div class="col-md-2">
            <p>{{ doc.status }}</p>
        </div>
        <div class="col-md-2">
            <p>{{ doc.project }}</p>
        </div>
        <div class="col-md-2">
            <p>{{ doc.name }}</p>
        </div>
        <div class="col-md-2">
            <p>{{ timeDifference }}</p>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        doc: {
            type: Object,
            required: true
        }
    },
    computed: {
        timeDifference() {
            const now = new Date();
            const modifiedDate = new Date(this.doc.modified);

            let diff = now - modifiedDate;

            const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
            diff -= years * (1000 * 60 * 60 * 24 * 365);

            const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
            diff -= months * (1000 * 60 * 60 * 24 * 30);

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            diff -= days * (1000 * 60 * 60 * 24);

            const hours = Math.floor(diff / (1000 * 60 * 60));

            return `${years}:${months}:${days}:${hours}`;
        }
    } 
}
</script>
