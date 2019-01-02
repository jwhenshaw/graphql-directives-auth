const { SchemaDirectiveVisitor } = require("apollo-server");
const { defaultFieldResolver } = require("graphql");
const strategies = require("./strategies");

class FieldAuthDirective extends SchemaDirectiveVisitor {
  // Visitor methods for nested types like fields and arguments
  // also receive a details object that provides information about
  // the parent and grandparent types.
  visitFieldDefinition(field, details) {
    console.log("FieldAuthDirective:visitFieldDef", { field, details });
    this.ensureFieldWrapped(field);
    field._requiredAuthRole = this.args.requires;
  }

  ensureFieldWrapped(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function(...args) {
      // Get the required Role from the field first, falling back
      // to the objectType if no Role is required by the field:
      const requiredRole = field._requiredAuthRole;

      if (!requiredRole) {
        // Let's be on the safe side
        throw new Error("not authorized");
      }

      const requestData = args[2];
      await this.executeStrategy(requiredRole, requestData);

      return resolve.apply(this, args);
    }.bind(this);
  }

  async executeStrategy(role, requestData) {
    const strategyResult = await strategies[role.toLowerCase()](requestData);

    if (!strategyResult) {
      throw new Error("not authorized");
    }
  }
}

module.exports = FieldAuthDirective;
