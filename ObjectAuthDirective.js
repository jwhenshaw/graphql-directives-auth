const { SchemaDirectiveVisitor } = require("apollo-server");
const { defaultFieldResolver } = require("graphql");
const strategies = require("./strategies");

class ObjectAuthDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    console.log("ObjectAuthDirective:visitObject", { type });
    this.ensureFieldsWrapped(type);
    type._requiredAuthRole = this.args.requires;
  }

  ensureFieldsWrapped(objectType) {
    // Mark the GraphQLObjectType object to avoid re-wrapping:
    if (objectType._authFieldsWrapped) return;
    objectType._authFieldsWrapped = true;

    const fields = objectType.getFields();
    console.log("ObjectAuthDirective:ensureFieldsWrapped", {
      objectType,
      fields
    });

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      const { resolve = defaultFieldResolver } = field;
      field.resolve = async function(...args) {
        // Get the required Role from the field first, falling back
        // to the objectType if no Role is required by the field:
        const requiredRole =
          field._requiredAuthRole || objectType._requiredAuthRole;

        if (!requiredRole) {
          // Let's be on the safe side
          throw new Error("not authorized");
        }

        const requestData = args[2];
        await this.executeStrategy(requiredRole, requestData);

        return resolve.apply(this, args);
      }.bind(this);
    });
  }

  async executeStrategy(role, requestData) {
    const strategyResult = await strategies[role.toLowerCase()](requestData);

    if (!strategyResult) {
      throw new Error("not authorized");
    }
  }
}

module.exports = ObjectAuthDirective;
